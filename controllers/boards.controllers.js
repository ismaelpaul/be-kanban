const {
	selectBoards,
	selectBoardsById,
	selectColumnsByBoardId,
	removeBoardById,
	insertBoard,
} = require('../models/boards.models');
const { insertColumn } = require('../models/columns.models');

exports.getBoards = (req, res, next) => {
	selectBoards()
		.then((boards) => {
			res.status(200).send({ boards });
		})
		.catch(next);
};

exports.getBoardById = (req, res, next) => {
	const { board_id } = req.params;
	selectBoardsById(board_id)
		.then((board) => {
			res.status(200).send({ board });
		})
		.catch(next);
};

exports.deleteBoardById = (req, res, next) => {
	const { board_id } = req.params;

	removeBoardById(board_id)
		.then((board) => {
			res.status(204).send({ board });
		})
		.catch(next);
};

exports.getColumnsByBoardId = (req, res, next) => {
	const { board_id } = req.params;

	selectColumnsByBoardId(board_id)
		.then((columns) => {
			res.status(200).send({ columns });
		})
		.catch(next);
};

exports.addNewBoardAndColumns = (req, res, next) => {
	const newBoard = req.body;
	const { user_id, board_name } = newBoard;
	const boardNameCapitalised = board_name
		.trim()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
	insertBoard(user_id, boardNameCapitalised).then((board) => {
		const board_id = board.board_id;
		const columns = newBoard.columns;

		const nonEmptyColumns = columns.filter(
			(column) => column.column_name.trim() !== ''
		);

		if (nonEmptyColumns.length > 0) {
			nonEmptyColumns.map((column) => {
				const columnNameCapitalised = column.column_name
					.trim()
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ');
				insertColumn({ board_id, column_name: columnNameCapitalised })
					.then(() => res.status(201).send({ board }))
					.catch(next);
			});
		} else {
			res.status(201).send({ board });
		}
	});
};
