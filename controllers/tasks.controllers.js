const {
	selectTasks,
	selectSubtasksByTaskId,
} = require('../models/tasks.models');

exports.getTasks = (req, res, next) => {
	selectTasks()
		.then((tasks) => res.status(200).send({ tasks }))
		.catch(next);
};

exports.getSubtasksByTaskId = (req, res, next) => {
	const { task_id } = req.params;

	selectSubtasksByTaskId(task_id)
		.then((subtasks) => {
			res.status(200).send({ subtasks });
		})
		.catch(next);
};
