const {
	selectColumns,
	selectTasksByColumnId,
	removeColumnsById,
} = require('../models/columns.models');

exports.getColumns = (req, res, next) => {
	selectColumns()
		.then((columns) => {
			res.status(200).send({ columns });
		})
		.catch(next);
};

exports.getTasksByColumnId = async (req, res, next) => {
	try {
		const { column_id } = req.params;

		const tasks = await selectTasksByColumnId(column_id);

		const formattedTasks = tasks.map((task) => ({
			...task,
			subtasks: task.subtasks || [],
		}));

		res.status(200).send({ tasks: formattedTasks });
	} catch (error) {
		next(error);
	}
};

exports.deleteColumnsByColumnId = (req, res, next) => {
	const columns = req.body;

	const columnsPromises = columns.map((column_id) => {
		return removeColumnsById(column_id);
	});

	Promise.all(columnsPromises)
		.then(() => res.status(201).send({ columns }))
		.catch(next);
};
