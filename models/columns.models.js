const db = require('../db/connection');

exports.selectColumns = () => {
	return db.query(`SELECT * FROM columns`).then((result) => result.rows);
};
