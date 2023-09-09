const { selectSubtasks } = require('../models/subtasks.models');

exports.getSubtasks = (req, res, next) => {
	selectSubtasks()
		.then((subtasks) => {
			res.status(200).send({ subtasks });
		})
		.catch(next);
};
