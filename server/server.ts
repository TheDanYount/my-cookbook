/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import argon2 from 'argon2';
import {
  ClientError,
  errorMiddleware,
  uploadsMiddlewareRecipes,
  uploadsMiddlewareUsers,
  authMiddleware,
} from './lib/index.js';
import jwt from 'jsonwebtoken';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) throw new Error('TOKEN_SECRET not found in .env');

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

app.post(
  '/api/auth/sign-up',
  uploadsMiddlewareUsers.single('image'),
  async (req, res, next) => {
    try {
      const {
        newPhotoUrl,
        username,
        password,
        email,
        firstName,
        lastName,
        style,
      } = req.body;
      const usernameCheckSql = `
      select *
      from "users"
      where "username" = $1
      `;
      const usernameCheckResult = await db.query(usernameCheckSql, [username]);
      if (usernameCheckResult.rows[0])
        throw new ClientError(401, `username already exists`);
      const hashedPassword = await argon2.hash(password);
      const photoUrl = `/images/recipe-images/${req?.file?.filename}`;
      let sql;
      let params;
      if (newPhotoUrl === 'new') {
        sql = `
    insert into "users" ( "photoUrl", "username", "password", "email", "firstName", "lastName", "style" )
    values ($1, $2, $3, $4, $5, $6, $7)
    returning "userId";
    `;
        params = [
          photoUrl,
          username,
          hashedPassword,
          email,
          firstName,
          lastName,
          style,
        ];
      } else {
        sql = `
    insert into "users" ( "username", "password", "email", "firstName", "lastName", "style" )
    values ($1, $2, $3, $4, $5, $6)
    returning "userId";
    `;
        params = [username, hashedPassword, email, firstName, lastName, style];
      }
      const result = await db.query(sql, params);
      if (!result.rows[0]) throw new ClientError(404, `sign-up failed`);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username) throw new ClientError(401, 'missing username');
    if (!password) throw new ClientError(401, 'missing password');
    const sql = `
    select *
    from "users"
    where "username" = $1
    `;
    const result = await db.query(sql, [username]);
    const user = result.rows[0];
    if (!user) throw new ClientError(401, 'user not found');
    const isAuthorized = await argon2.verify(user.password, password);
    if (!isAuthorized) {
      throw new ClientError(401, 'invalid credentials');
    }
    const payload = {
      userId: user.userId,
      photoUrl: user.photoUrl,
      username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      style: user.style,
    };
    const token = jwt.sign(payload, hashKey);
    res.status(200).json({ user: payload, token });
  } catch (err) {
    next(err);
  }
});

app.post('/api/create-cookbook', authMiddleware, async (req, res, next) => {
  try {
    const { style, title } = req.body;
    if (!style) throw new ClientError(400, 'style is required');
    if (!title) throw new ClientError(400, 'title is required');
    // Remove once form is updated
    const isPublic = false;
    if (!req.user?.userId) throw new ClientError(401, 'user not found');
    const sql = `
    insert into "cookbooks" ("userId", "style", "title", "isPublic")
    values ($1, $2, $3, $4)
    returning *;
    `;
    const result = await db.query(sql, [
      req.user?.userId,
      style,
      title,
      isPublic,
    ]);
    if (!result.rows[0]) throw new ClientError(404, `Cookbook add failed`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.post(
  '/api/create-recipe',
  authMiddleware,
  uploadsMiddlewareRecipes.single('image'),
  async (req, res, next) => {
    try {
      const imageUrl = req.file
        ? `/images/recipe-images/${req.file.filename}`
        : '';
      const cookbookId = Number(req.body.cookbookId);
      const { title, ingredients, directions, notes, length, order } = req.body;
      // Remove once form is updated
      const isFavorite = false;
      // Remove once form is updated
      const isPublic = false;
      if (!cookbookId)
        throw new ClientError(400, 'cookbookId for recipe not recognized');
      if (!title) throw new ClientError(400, 'title is required');
      if (!order)
        throw new ClientError(
          400,
          'client failed to automatically add order attribute'
        );
      if (!length)
        throw new ClientError(
          400,
          'client failed to automatically add length attribute'
        );
      const authSql = `
      select "userId"
      from "cookbooks"
      where "cookbookId" = $1
      `;
      const authResult = await db.query(authSql, [cookbookId]);
      if (!authResult.rows[0])
        throw new ClientError(400, 'failed to find cookbook');
      if (authResult.rows[0].userId !== req.user?.userId)
        throw new ClientError(401, 'user not authorized to add to cookbook');
      const sql = `
    insert into "recipes" ("cookbookId", "title", "imageUrl", "isFavorite", "ingredients", "directions", "notes", "order", "length", "isPublic")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    returning *;
    `;
      const result = await db.query(sql, [
        cookbookId,
        title,
        imageUrl,
        isFavorite,
        ingredients,
        directions,
        notes,
        order,
        length,
        isPublic,
      ]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  '/api/read-cookbook/:cookbookId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const { cookbookId } = req.params;
      if (!req.user?.userId)
        throw new ClientError(401, 'user not properly logged in');
      if (!Number.isInteger(+cookbookId))
        throw new ClientError(401, 'cookbookId must be an integer');
      const sql = `
    select *
    from "cookbooks"
    where "userId" = $1 AND "cookbookId" = $2
    `;
      const result = await db.query(sql, [userId, cookbookId]);
      if (!result.rows[0]) throw new ClientError(404, 'cookbook not found');
      res.status(200).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.get('/api/read-cookbooks', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!req.user?.userId)
      throw new ClientError(401, 'user not properly logged in');
    const sql = `
    select *
    from "cookbooks"
    where "userId" = $1
    order by "cookbookId";
    `;
    const result = await db.query(sql, [userId]);
    // No error for if !result.rows[0] because there may be no cookbooks
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get(
  '/api/read-recipes/:cookbookId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { cookbookId } = req.params;
      if (!Number.isInteger(+cookbookId))
        throw new ClientError(400, 'cookbookId must be an integer');
      const authSql = `
      select "userId"
      from "cookbooks"
      where "cookbookId" = $1
      `;
      const authResult = await db.query(authSql, [cookbookId]);
      if (!authResult.rows[0])
        throw new ClientError(400, 'failed to find cookbook');
      if (authResult.rows[0].userId !== req.user?.userId)
        throw new ClientError(401, 'user not authorized to access cookbook');
      const sql = `
    select *
    from "recipes"
    where "cookbookId" = $1
    order by "order";
    `;
      const result = await db.query(sql, [cookbookId]);
      // No error for if !result.rows[0] because there may be no recipes
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  '/api/read-recipe-by-id/:cookbookId/:recipeId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      if (!Number.isInteger(+cookbookId))
        throw new ClientError(400, 'cookbookId must be an integer');
      if (!Number.isInteger(+recipeId))
        throw new ClientError(400, `recipeId must be an integer`);
      const authSql = `
      select "userId"
      from "cookbooks"
      where "cookbookId" = $1
      `;
      const authResult = await db.query(authSql, [cookbookId]);
      if (!authResult.rows[0])
        throw new ClientError(400, 'failed to find cookbook');
      if (authResult.rows[0].userId !== req.user?.userId)
        throw new ClientError(401, 'user not authorized to add to cookbook');
      const sql = `
    select *
    from "recipes"
    where ("cookbookId" = $1 AND "recipeId" = $2)
    `;
      const result = await db.query(sql, [cookbookId, recipeId]);
      if (!result.rows[0]) throw new ClientError(404, `Recipe not found`);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

app.put(
  '/api/update-recipe/:cookbookId/:recipeId',
  authMiddleware,
  uploadsMiddlewareRecipes.single('image'),
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      if (!Number.isInteger(+cookbookId))
        throw new ClientError(400, 'cookbookId must be an integer');
      if (!Number.isInteger(+recipeId))
        throw new ClientError(400, `recipeId must be an integer`);
      const authSql = `
      select "userId"
      from "cookbooks"
      where "cookbookId" = $1
      `;
      const authResult = await db.query(authSql, [cookbookId]);
      if (!authResult.rows[0])
        throw new ClientError(400, 'failed to find cookbook');
      if (authResult.rows[0].userId !== req.user?.userId)
        throw new ClientError(401, 'user not authorized to update cookbook');
      const imageUrl = req.file
        ? `/images/recipe-images/${req.file.filename}`
        : '';
      const {
        title,
        ingredients,
        directions,
        notes,
        length,
        order,
        imageState,
      } = req.body;
      // Remove once form is updated
      const isFavorite = false;
      // Remove once form is updated
      const isPublic = false;
      let sql;
      if (imageState) {
        sql = `
    update "recipes"
    set "title" = $3, "imageUrl" = $4, "isFavorite" = $5, "ingredients" = $6,
    "directions" = $7, "notes" = $8, "order" = $9, "length" = $10, "isPublic" = $11
    where ("cookbookId" = $1 AND "recipeId" = $2)
    returning *;
    `;
      } else {
        sql = `
    update "recipes"
    set "title" = $3, "isFavorite" = $5, "ingredients" = $6,
    "directions" = $7, "notes" = $8, "order" = $9, "length" = $10, "isPublic" = $11
    where ("cookbookId" = $1 AND "recipeId" = $2)
    returning *;
    `;
      }
      const result = await db.query(sql, [
        cookbookId,
        recipeId,
        title,
        imageUrl,
        isFavorite,
        ingredients,
        directions,
        notes,
        order,
        length,
        isPublic,
      ]);
      if (!result.rows[0]) throw new ClientError(404, `Recipe not found`);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.put(
  '/api/re-order-recipes/:cookbookId/:recipeId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      const { order } = req.body;
      if (!Number.isInteger(+cookbookId))
        throw new ClientError(400, 'cookbookId must be an integer');
      if (!Number.isInteger(+recipeId))
        throw new ClientError(400, `recipeId must be an integer`);
      if (!Number.isInteger(+order))
        throw new ClientError(400, 'order must be an integer');
      const authSql = `
      select "userId"
      from "cookbooks"
      where "cookbookId" = $1
      `;
      const authResult = await db.query(authSql, [cookbookId]);
      if (!authResult.rows[0])
        throw new ClientError(400, 'failed to find cookbook');
      if (authResult.rows[0].userId !== req.user?.userId)
        throw new ClientError(401, 'user not authorized to update cookbook');
      const sql = `
    update "recipes"
    set "order" = $3
    where ("cookbookId" = $1 AND "recipeId" = $2)
    returning *;
    `;
      const result = await db.query(sql, [cookbookId, recipeId, order]);
      if (!result.rows[0]) throw new ClientError(404, `Recipe not found`);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.delete(
  '/api/delete-recipe/:cookbookId/:recipeId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      if (!Number.isInteger(+cookbookId))
        throw new ClientError(400, 'cookbookId must be an integer');
      if (!Number.isInteger(+recipeId))
        throw new ClientError(400, `recipeId must be an integer`);
      const authSql = `
      select "userId"
      from "cookbooks"
      where "cookbookId" = $1
      `;
      const authResult = await db.query(authSql, [cookbookId]);
      if (!authResult.rows[0])
        throw new ClientError(400, 'failed to find cookbook');
      if (authResult.rows[0].userId !== req.user?.userId)
        throw new ClientError(
          401,
          'user not authorized to delete from cookbook'
        );
      const sql = `
    delete
    from "recipes"
    where ("cookbookId" = $1 AND "recipeId" = $2)
    returning *;
    `;
      const result = await db.query(sql, [cookbookId, recipeId]);
      if (!result.rows[0]) throw new ClientError(404, `Recipe not found`);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

/*
 * Handles paths that aren't handled by any other route handler.
 * It responds with `index.html` to support page refreshes with React Router.
 * This must be the _last_ route, just before errorMiddleware.
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});
