const db = require('../db/connection');

exports.selectTasks = () => {
	return db.query(`SELECT * FROM tasks`).then((result) => {
		return result.rows;
	});
};

exports.removeTaskById = (task_id) => {
	return db
		.query(`DELETE FROM subtasks WHERE task_id = $1;`, [task_id])
		.then(() => {
			return db.query(`DELETE FROM tasks WHERE task_id = $1 RETURNING *;`, [
				task_id,
			]);
		})
		.then((result) => {
			return result.rows[0];
		});
};

exports.selectSubtasksByTaskId = (task_id) => {
	return db
		.query(
			`SELECT subtasks.subtask_id, subtasks.task_id, subtasks.title, subtasks.is_completed FROM subtasks LEFT JOIN tasks ON subtasks.task_id = tasks.task_id WHERE tasks.task_id=$1 ORDER BY subtask_id;`,
			[task_id]
		)
		.then((result) => {
			return result.rows;
		});
};

exports.insertTask = (column_id, title, description, status) => {
	return db
		.query(
			`INSERT INTO tasks (column_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *;`,
			[column_id, title, description, status]
		)
		.then((result) => {
			return result.rows[0];
		});
};
