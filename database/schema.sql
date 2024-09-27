set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "users" (
  "userId" serial PRIMARY KEY,
  "photoUrl" text,
  "username" text,
  "password" text,
  "firstName" text,
  "lastName" text,
  "style" text,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "activities" (
  "activityId" serial PRIMARY KEY,
  "userId" int,
  "content" text,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "messages" (
  "messageId" serial PRIMARY KEY,
  "recipientId" int,
  "senderId" int,
  "title" text,
  "content" text,
  "recipeId" int,
  "cookbookId" int
);

CREATE TABLE "cookbooks" (
  "cookbookId" serial PRIMARY KEY,
  "userId" int,
  "style" text,
  "title" text,
  "isPublic" boolean
);

CREATE TABLE "viewers" (
  "viewerId" serial PRIMARY KEY,
  "userId" int,
  "cookbookId" int,
  "recipeId" int
);

CREATE TABLE "recipes" (
  "recipeId" serial PRIMARY KEY,
  "cookBookId" int,
  "title" text,
  "imageUrl" text,
  "isFavorite" boolean,
  "ingredients" text,
  "directions" text,
  "notes" text,
  "isPublic" boolean
);

ALTER TABLE "activities" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "messages" ADD FOREIGN KEY ("recipientId") REFERENCES "users" ("userId");

ALTER TABLE "messages" ADD FOREIGN KEY ("senderId") REFERENCES "users" ("userId");

ALTER TABLE "messages" ADD FOREIGN KEY ("recipeId") REFERENCES "recipes" ("recipeId");

ALTER TABLE "messages" ADD FOREIGN KEY ("cookbookId") REFERENCES "cookbooks" ("cookbookId");

ALTER TABLE "cookbooks" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "viewers" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "viewers" ADD FOREIGN KEY ("cookbookId") REFERENCES "cookbooks" ("cookbookId");

ALTER TABLE "viewers" ADD FOREIGN KEY ("recipeId") REFERENCES "recipes" ("recipeId");

ALTER TABLE "recipes" ADD FOREIGN KEY ("cookBookId") REFERENCES "cookbooks" ("cookbookId");
