const {
	selectColumns,
	selectTasksByColumnId,
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
