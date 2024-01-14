const db = require('../db/connection');

exports.selectColumns = () => {
	return db.query(`SELECT * FROM columns ORDER BY column_id`).then((result) => {
		return result.rows;
	});
};

exports.selectTasksByColumnId = (column_id) => {
	return db
		.query(
			`SELECT tasks.task_id, tasks.column_id, tasks.description, tasks.title, tasks.status, tasks.position FROM tasks LEFT JOIN columns ON tasks.column_id = columns.column_id WHERE columns.column_id=$1 ORDER BY position;`,
			[column_id]
		)
		.then((result) => {
			return result.rows;
		});
};

exports.insertColumn = ({ board_id, name }) => {
	return db
		.query(
			`INSERT INTO columns (board_id, name) VALUES ($1, $2) RETURNING *;`,
			[board_id, name]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.updateColumnNameById = (column_id, name) => {
	return db
		.query(
			`UPDATE columns 
	SET name = $1  	
	WHERE column_id = $2 
	RETURNING *;`,
			[name, column_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};
