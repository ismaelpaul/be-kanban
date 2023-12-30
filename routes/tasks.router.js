const express = require('express');
const {
	getTasks,
	getSubtasksByTaskId,
	deleteTaskById,
	addNewTaskAndSubtasks,
	addNewSubtaskByTaskId,
	patchTaskPositionAndStatusByTaskId,
	patchTaskByTaskId,
} = require('../controllers/tasks.controllers');

const tasksRouter = express.Router();

tasksRouter.route('/').get(getTasks).post(addNewTaskAndSubtasks);

tasksRouter.route('/:task_id').delete(deleteTaskById).patch(patchTaskByTaskId);

tasksRouter
	.route('/:task_id/position-status')
	.patch(patchTaskPositionAndStatusByTaskId);

tasksRouter
	.route('/:task_id/subtasks')
	.get(getSubtasksByTaskId)
	.post(addNewSubtaskByTaskId);

module.exports = tasksRouter;
