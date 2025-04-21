const express = require('express');

const boardsRouter = require('./boards.router');
const columnsRouter = require('./columns.router');
const usersRouter = require('./user.router');
const tasksRouter = require('./tasks.router');
const subtasksRouter = require('./subtasks.router');
const teamsRouter = require('./teams.router');
const invitationsRouter = require('./invitations.router');

const apiRouter = express.Router();

apiRouter.use('/teams', teamsRouter);

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

// /invitations
apiRouter.use('/invitations', invitationsRouter);

module.exports = apiRouter;
