const express = require('express');
const {
	getSubtasks,
	patchSubtaskCompletionById,
	getSubtasksById,
} = require('../controllers/subtasks.controllers');

const subtasksRouter = express.Router();

subtasksRouter.route('/').get(getSubtasks);

subtasksRouter
	.route('/:subtask_id')
	.get(getSubtasksById)
	.patch(patchSubtaskCompletionById);

module.exports = subtasksRouter;
