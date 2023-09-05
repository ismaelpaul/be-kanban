const db = require('../db/connection');

exports.selectBoards = () => {
	return db.query(`SELECT * FROM boards`).then((result) => {
		return result.rows;
	});
};
