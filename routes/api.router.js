const express = require('express');

const boardsRouter = require('./boards.router');

const apiRouter = express.Router();

// /boards
apiRouter.use('/boards', boardsRouter);

module.exports = apiRouter;
