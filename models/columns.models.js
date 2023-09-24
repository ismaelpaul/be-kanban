const db = require('../db/connection');

exports.selectColumns = () => {
	return db.query(`SELECT * FROM columns`).then((result) => {
		return result.rows;
	});
};

exports.selectTasksByColumnsId = (column_id) => {
	return db
		.query(
			`SELECT tasks.task_id, tasks.column_id, tasks.description, tasks.title, tasks.status FROM tasks LEFT JOIN columns ON tasks.column_id = columns.column_id WHERE columns.column_id=$1;`,
			[column_id]
		)
		.then((result) => {
			return result.rows;
		});
};
