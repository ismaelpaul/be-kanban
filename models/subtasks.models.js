const db = require('../db/connection');

exports.selectSubtasks = async () => {
	return await db.query(`SELECT * FROM subtasks`).then((result) => result.rows);
};

exports.selectSubtasksById = async (subtask_id) => {
	return await db
		.query(`SELECT * FROM subtasks WHERE subtasks.subtask_id=$1;`, [subtask_id])
		.then((result) => {
			return result.rows[0];
		});
};

exports.updateSubtaskCompletionById = async (is_completed, subtask_id) => {
	return await db
		.query(
			`WITH updated_subtask AS (
		   UPDATE subtasks
		   SET is_completed = $1
		   WHERE subtask_id = $2
		   RETURNING task_id
		 )
		 SELECT subtasks.*, tasks.column_id
		 FROM updated_subtask
		 JOIN tasks ON tasks.task_id = updated_subtask.task_id
		 JOIN subtasks ON subtasks.subtask_id = $2;`,
			[is_completed, subtask_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.updateSubtaskTitleById = async (title, subtask_id) => {
	return await db
		.query(
			`UPDATE subtasks SET title = $1 WHERE subtask_id = $2 RETURNING *;`,
			[title, subtask_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.insertSubtask = async (task_id, title, is_completed) => {
	return await db
		.query(
			`INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, $2, $3) RETURNING *;`,
			[task_id, title, is_completed]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.removeSubtask = async (subtask_id) => {
	return await db
		.query(`DELETE from subtasks WHERE subtask_id = $1`, [subtask_id])
		.then((result) => {
			return result.rows[0];
		});
};
