const db = require('../db/connection');

exports.selectBoards = () => {
	return db
		.query(`SELECT * FROM boards ORDER BY board_id`)
		.then((result) => result.rows);
};

exports.selectBoardsById = (board_id) => {
	return db
		.query(`SELECT * FROM boards WHERE boards.board_id=$1;`, [board_id])
		.then((result) => {
			if (result.rowCount === 0) {
				return Promise.reject({ status: 404, msg: 'Board not found.' });
			}
			return result.rows[0];
		});
};

exports.removeBoardById = (board_id) => {
	return db
		.query(
			`DELETE FROM subtasks WHERE task_id IN (SELECT tasks.task_id FROM tasks WHERE column_id IN (SELECT column_id FROM columns WHERE board_id = $1));`,
			[board_id]
		)
		.then(() => {
			return db.query(
				`DELETE FROM tasks WHERE column_id IN (SELECT column_id FROM columns WHERE board_id = $1);`,
				[board_id]
			);
		})
		.then(() => {
			return db.query(`DELETE FROM columns WHERE board_id = $1;`, [board_id]);
		})
		.then(() => {
			return db.query(`DELETE FROM boards WHERE board_id = $1 RETURNING *;`, [
				board_id,
			]);
		})
		.then((result) => {
			return result.rows[0];
		});
};

exports.selectColumnsByBoardId = (board_id) => {
	return db
		.query(
			`SELECT 
			columns.column_id, 
			columns.board_id,
			columns.name
			 FROM columns LEFT JOIN boards ON columns.board_id = boards.board_id WHERE boards.board_id=$1 ORDER BY column_id;`,
			[board_id]
		)
		.then((result) => {
			return result.rows;
		});
};

exports.insertBoard = (user_id, name) => {
	return db
		.query(`INSERT INTO boards (user_id, name) VALUES ($1, $2) RETURNING *;`, [
			user_id,
			name,
		])
		.then((result) => {
			return result.rows[0];
		});
};

exports.updateBoardById = (board_id, name) => {
	return db
		.query(
			`UPDATE boards
			SET name = $1  
			WHERE board_id= $2 
			RETURNING *;`,
			[name, board_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};
