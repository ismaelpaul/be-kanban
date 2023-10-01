const {
	selectBoards,
	selectBoardsById,
	selectColumnsByBoardId,
	removeBoardById,
} = require('../models/boards.models');

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
