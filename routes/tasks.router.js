const express = require('express');
const {
	getTasks,
	getSubtasksByTaskId,
	deleteTaskById,
} = require('../controllers/tasks.controllers');

const tasksRouter = express.Router();

tasksRouter.route('/').get(getTasks);

tasksRouter.route('/:task_id').delete(deleteTaskById);

tasksRouter.route('/:task_id/subtasks').get(getSubtasksByTaskId);

module.exports = tasksRouter;
