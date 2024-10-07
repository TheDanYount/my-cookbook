-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- EXAMPLE:

--  insert into "todos"
--    ("task", "isCompleted")
--    values
--      ('Learn to code', false),
--      ('Build projects', false),
--      ('Get a job', false);

insert into "users" ("photoUrl", "username", "password", "email", "firstName", "lastName", "style")
values ('test', 'dan', 'danpass', 'dan@dan.dan', 'dan', 'yount', '#C45056');

insert into "cookbooks" ("userId", "style", "title", "isPublic")
values (1, '#4C301E', 'My First Cookbook', false);
