const { selectTasks } = require('../models/tasks.models');

exports.getTasks = (req, res, next) => {
	selectTasks()
		.then((tasks) => res.status(200).send({ tasks }))
		.catch(next);
};
