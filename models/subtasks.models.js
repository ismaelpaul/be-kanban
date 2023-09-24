const db = require('../db/connection');

exports.selectSubtasks = () => {
	return db.query(`SELECT * FROM subtasks`).then((result) => result.rows);
};

exports.updateSubtaskCompletionById = (is_completed, subtask_id) => {
	return db
		.query(
			`UPDATE subtasks 
			SET is_completed = $1  
			WHERE subtask_id = $2 
			RETURNING *;`,
			[is_completed, subtask_id]
		)
		.then((result) => {
			result.rows[0];
		});
};
