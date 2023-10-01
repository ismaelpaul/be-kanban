const express = require('express');
const {
	getBoards,
	getBoardById,
	getColumnsByBoardId,
	deleteBoardById,
} = require('../controllers/boards.controllers');

const boardsRouter = express.Router();

boardsRouter.route('/').get(getBoards);

boardsRouter.route('/:board_id').get(getBoardById).delete(deleteBoardById);

boardsRouter.route('/:board_id/columns').get(getColumnsByBoardId);

module.exports = boardsRouter;
