const express = require('express');
const {
	getSubtasks,
	patchSubtaskCompletionById,
} = require('../controllers/subtasks.controllers');

const subtasksRouter = express.Router();

subtasksRouter.route('/').get(getSubtasks);

subtasksRouter.route('/:subtask_id').patch(patchSubtaskCompletionById);

module.exports = subtasksRouter;
