const db = require('../db/connection');

exports.selectColumns = () => {
	return db.query(`SELECT * FROM columns ORDER BY column_id`).then((result) => {
		return result.rows;
	});
};

exports.selectTasksByColumnId = async (column_id) => {
	try {
		const result = await db.query(
			`SELECT tasks.task_id, tasks.column_id, tasks.description, tasks.title, tasks.status, tasks.position, 
		  (SELECT json_agg(subtasks) FROM subtasks WHERE subtasks.task_id = tasks.task_id) AS subtasks
		  FROM tasks 
		  LEFT JOIN columns ON tasks.column_id = columns.column_id 
		  WHERE columns.column_id=$1 
		  ORDER BY position;`,
			[column_id]
		);
		return result.rows;
	} catch (error) {
		throw error;
	}
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

exports.removeColumnsById = (column_id) => {
	return db
		.query(
			`DELETE FROM subtasks WHERE task_id IN (SELECT tasks.task_id FROM tasks WHERE column_id = $1);`,
			[column_id]
		)
		.then(() => {
			return db.query(`DELETE FROM tasks WHERE column_id = $1;`, [column_id]);
		})
		.then(() => {
			return db.query(`DELETE FROM columns WHERE column_id = $1;`, [column_id]);
		})
		.then((result) => {
			return result.rows[0];
		});
};
