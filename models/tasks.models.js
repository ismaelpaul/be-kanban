const db = require('../db/connection');

exports.selectTasks = () => {
	return db.query(`SELECT * FROM tasks`).then((result) => {
		return result.rows;
	});
};

exports.selectSubtasksByTaskId = (task_id) => {
	console.log(task_id, '<<< id');
	return db
		.query(
			`SELECT subtasks.subtask_id, subtasks.task_id, subtasks.title, subtasks.is_completed FROM subtasks LEFT JOIN tasks ON subtasks.task_id = tasks.task_id WHERE tasks.task_id=$1;`,
			[task_id]
		)
		.then((result) => {
			return result.rows;
		});
};
