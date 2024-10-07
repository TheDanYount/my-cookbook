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

app.post(
  '/api/create-recipe',
  uploadsMiddlewareRecipes.single('image'),
  async (req, res, next) => {
    try {
      const imageUrl = req.file
        ? `/images/recipe-images/${req.file.filename}`
        : '';
      const { title, ingredients, directions, notes } = req.body;
      // Remove once form is updated
      const isFavorite = false;
      // Remove once form is updated
      const isPublic = false;
      // Remove once form is updated
      const length = 1;
      // Remove once form is updated
      const order = 1;
      // Remove once form is updated
      const cookbookId = 1;
      if (!cookbookId)
        throw new ClientError(400, 'cookbookId for recipe not recognized');
      if (!title) throw new ClientError(400, 'title is required');
      if (!order)
        throw new ClientError(400, 'internal error determining order');
      if (!length)
        throw new ClientError(400, 'internal error determining length');
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
