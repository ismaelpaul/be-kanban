const db = require('../db/connection');

exports.selectBoards = () => {
	return db.query(`SELECT * FROM boards`).then((result) => result.rows);
};

exports.selectBoardsById = (board_id) => {
	return db
		.query(`SELECT * FROM boards WHERE boards.board_id=$1;`, [board_id])
		.then((result) => result.rows[0]);
};

exports.selectColumnsByBoardId = (board_id) => {
	return db
		.query(
			`SELECT 
			columns.column_id, 
			columns.board_id,
			columns.name
			 FROM columns LEFT JOIN boards ON columns.board_id = boards.board_id WHERE boards.board_id=$1;`,
			[board_id]
		)
		.then((result) => {
			return result.rows;
		});
};
