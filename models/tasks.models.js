const db = require('../db/connection');

exports.selectTasks = () => {
	return db.query(`SELECT * FROM tasks`).then((result) => {
		return result.rows;
	});
};
