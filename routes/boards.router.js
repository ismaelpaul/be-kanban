const express = require('express');
const {
	getBoards,
	getBoardById,
	getColumnsByBoardId,
	deleteBoardById,
	addNewBoardAndColumns,
} = require('../controllers/boards.controllers');

const boardsRouter = express.Router();

boardsRouter.route('/').get(getBoards).post(addNewBoardAndColumns);

boardsRouter.route('/:board_id').get(getBoardById).delete(deleteBoardById);

boardsRouter.route('/:board_id/columns').get(getColumnsByBoardId);

module.exports = boardsRouter;
