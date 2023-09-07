const { selectColumns } = require('../models/columns.models');

exports.getColumns = (req, res, next) => {
	selectColumns()
		.then((columns) => {
			res.status(200).send({ columns });
		})
		.catch(next);
};
