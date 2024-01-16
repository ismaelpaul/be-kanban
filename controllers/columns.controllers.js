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

exports.getTasksByColumnId = (req, res, next) => {
	const { column_id } = req.params;

	selectTasksByColumnId(column_id)
		.then((tasks) => {
			res.status(200).send({ tasks });
		})
		.catch(next);
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
