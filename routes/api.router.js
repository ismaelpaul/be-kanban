const express = require('express');

const boardsRouter = require('./boards.router');
const columnsRouter = require('./columns.router');
const usersRouter = require('./users.router');
const tasksRouter = require('./tasks.router');

const apiRouter = express.Router();

// /users
apiRouter.use('/users', usersRouter);

// /boards
apiRouter.use('/boards', boardsRouter);

// /columns
apiRouter.use('/columns', columnsRouter);

// /tasks
apiRouter.use('/tasks', tasksRouter);

module.exports = apiRouter;
