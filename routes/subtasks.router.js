const express = require('express');
const { getSubtasks } = require('../controllers/subtasks.controllers');

const subtasksRouter = express.Router();

subtasksRouter.route('/').get(getSubtasks);

module.exports = subtasksRouter;
