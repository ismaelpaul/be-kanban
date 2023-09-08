const express = require('express');
const { getTasks } = require('../controllers/tasks.controllers');

const tasksRouter = express.Router();

tasksRouter.route('/').get(getTasks);

module.exports = tasksRouter;
