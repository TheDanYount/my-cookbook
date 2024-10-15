/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import {
  ClientError,
  errorMiddleware,
  uploadsMiddlewareRecipes,
} from './lib/index.js';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

app.get('/api/read-recipes/:cookbookId', async (req, res, next) => {
  try {
    const { cookbookId } = req.params;
    if (!Number.isInteger(+cookbookId))
      throw new ClientError(400, 'cookbookId must be an integer');
    const sql = `
    select *
    from "recipes"
    where "cookbookId" = $1
    order by "order";
    `;
    const result = await db.query(sql, [cookbookId]);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get(
  '/api/read-recipe-by-id/:cookbookId/:recipeId',
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      if (!Number.isInteger(+cookbookId))
        throw new ClientError(400, 'cookbookId must be an integer');
      if (!Number.isInteger(+recipeId))
        throw new ClientError(400, `order must be an integer`);
      const sql = `
    select *
    from "recipes"
    where ("cookbookId" = $1 AND "recipeId" = $2)
    `;
      const result = await db.query(sql, [cookbookId, recipeId]);
      if (!result.rows[0]) throw new ClientError(404, `Recipes not found`);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  '/api/create-recipe',
  uploadsMiddlewareRecipes.single('image'),
  async (req, res, next) => {
    try {
      const imageUrl = req.file
        ? `/images/recipe-images/${req.file.filename}`
        : '';
      const { title, ingredients, directions, notes, length, order } = req.body;
      // Remove once form is updated
      const isFavorite = false;
      // Remove once form is updated
      const isPublic = false;
      // Remove once form is updated
      const cookbookId = 1;
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

app.put(
  '/api/update-recipe/:cookbookId/:recipeId',
  uploadsMiddlewareRecipes.single('image'),
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      if (!cookbookId) throw new ClientError(400, 'cookbookId is required');
      if (!recipeId) throw new ClientError(400, 'recipeId is required');
      const potentialImageUrl = req.file
        ? `/images/recipe-images/${req.file.filename}`
        : '';
      const { title, ingredients, directions, notes, length, order, imageUrl } =
        req.body;
      const trueUrl = potentialImageUrl || imageUrl;
      // Remove once form is updated
      const isFavorite = false;
      // Remove once form is updated
      const isPublic = false;
      const sql = `
    update "recipes"
    set "title" = $3, "imageUrl" = $4, "isFavorite" = $5, "ingredients" = $6,
    "directions" = $7, "notes" = $8, "order" = $9, "length" = $10, "isPublic" = $11
    where ("cookbookId" = $1 AND "recipeId" = $2)
    returning *;
    `;
      const result = await db.query(sql, [
        cookbookId,
        recipeId,
        title,
        trueUrl,
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
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      const { order } = req.body;
      if (!cookbookId) throw new ClientError(400, 'cookbookId is required');
      if (!recipeId) throw new ClientError(400, 'recipeId is required');
      if (!order) throw new ClientError(400, 'order is required');
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
  async (req, res, next) => {
    try {
      const { cookbookId, recipeId } = req.params;
      if (!cookbookId) throw new ClientError(400, 'cookbookId is required');
      if (!recipeId) throw new ClientError(400, 'recipeId is required');
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
