const express = require('express');

const boardsRouter = require('./boards.router');
const columnsRouter = require('./columns.router');
const usersRouter = require('./users.router');
const tasksRouter = require('./tasks.router');
const subtasksRouter = require('./subtasks.router');
const authRouter = require('./auth.router');

const apiRouter = express.Router();

// /users
apiRouter.use('/users', usersRouter);

// /boards
apiRouter.use('/boards', boardsRouter);

// /columns
apiRouter.use('/columns', columnsRouter);

// /tasks
apiRouter.use('/tasks', tasksRouter);

// /tasks
apiRouter.use('/subtasks', subtasksRouter);

apiRouter.use('/auth', authRouter);

module.exports = apiRouter;
