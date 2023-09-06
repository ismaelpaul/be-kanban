const { selectBoards, selectBoardsById } = require('../models/boards.models');

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
