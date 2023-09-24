const {
	selectSubtasks,
	updateSubtaskCompletionById,
} = require('../models/subtasks.models');

exports.getSubtasks = (req, res, next) => {
	selectSubtasks()
		.then((subtasks) => {
			res.status(200).send({ subtasks });
		})
		.catch(next);
};

exports.patchSubtaskCompletionById = (req, res, next) => {
	const { is_completed } = req.body;
	const { subtask_id } = req.params;

	updateSubtaskCompletionById(is_completed, subtask_id)
		.then((subtask) => {
			res.status(200).send({ subtask });
		})
		.catch(next);
};
