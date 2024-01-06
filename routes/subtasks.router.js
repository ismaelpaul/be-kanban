const express = require('express');
const {
	getSubtasks,
	patchSubtaskCompletionById,
	getSubtasksById,
	deleteSubtasks,
	patchSubtaskTitleById,
} = require('../controllers/subtasks.controllers');

const subtasksRouter = express.Router();

subtasksRouter.route('/').get(getSubtasks).delete(deleteSubtasks);

subtasksRouter
	.route('/:subtask_id')
	.get(getSubtasksById)
	.patch(patchSubtaskTitleById);

subtasksRouter
	.route('/:subtask_id/completion')
	.patch(patchSubtaskCompletionById);

module.exports = subtasksRouter;
