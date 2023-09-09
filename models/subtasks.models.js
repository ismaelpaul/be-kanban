const db = require('../db/connection');

exports.selectSubtasks = () => {
	return db.query(`SELECT * FROM subtasks`).then((result) => result.rows);
};
