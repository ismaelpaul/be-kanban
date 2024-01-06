const {
	selectSubtasks,
	updateSubtaskCompletionById,
	selectSubtasksById,
	removeSubtask,
	updateSubtaskTitleById,
} = require('../models/subtasks.models');

exports.getSubtasks = (req, res, next) => {
	selectSubtasks()
		.then((subtasks) => {
			res.status(200).send({ subtasks });
		})
		.catch(next);
};

exports.getSubtasksById = (req, res, next) => {
	const { subtask_id } = req.params;
	selectSubtasksById(subtask_id)
		.then((subtask) => {
			res.status(200).send({ subtask });
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

exports.patchSubtaskTitleById = (req, res, next) => {
	const { subtask_id } = req.params;
	const { title } = req.body;

	updateSubtaskTitleById(title, subtask_id).then((subtask) => {
		res.status(200).send({ subtask });
	});
};

exports.deleteSubtasks = (req, res, next) => {
	const subtasksIds = req.body;

	const deletionSubtasksPromise = subtasksIds.map((subtask_id) =>
		removeSubtask(subtask_id)
	);
	Promise.all(deletionSubtasksPromise)
		.then(() => res.status(204).send({ message: 'Deleted' }))
		.catch(next);
};
