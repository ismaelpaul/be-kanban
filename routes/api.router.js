const express = require('express');

const boardsRouter = require('./boards.router');
const columnsRouter = require('./columns.router');
const usersRouter = require('./users.router');

const apiRouter = express.Router();

// /boards
apiRouter.use('/boards', boardsRouter);

// /columns
apiRouter.use('/columns', columnsRouter);

// /users
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
