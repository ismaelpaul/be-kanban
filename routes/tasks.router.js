const express = require('express');
const {
	getTasks,
	getSubtasksByTaskId,
	deleteTaskById,
	addNewTaskAndSubtasks,
	patchTaskPositionByTaskId,
} = require('../controllers/tasks.controllers');

const tasksRouter = express.Router();

tasksRouter.route('/').get(getTasks).post(addNewTaskAndSubtasks);

tasksRouter
	.route('/:task_id')
	.delete(deleteTaskById)
	.patch(patchTaskPositionByTaskId);

tasksRouter.route('/:task_id/subtasks').get(getSubtasksByTaskId);

module.exports = tasksRouter;
