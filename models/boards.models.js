const db = require('../db/connection');

exports.selectBoards = () => {
	return db.query(`SELECT * FROM boards`).then((result) => result.rows);
};

exports.selectBoardsById = (board_id) => {
	return db
		.query(`SELECT * FROM boards WHERE boards.board_id=$1;`, [board_id])
		.then((result) => result.rows[0]);
};
