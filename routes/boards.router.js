const express = require('express');
const {
	getBoards,
	getBoardById,
	getColumnsByBoardId,
	deleteBoardById,
	addNewBoardAndColumns,
	patchBoardsAndColumns,
	patchColumnsByBoardId,
} = require('../controllers/boards.controllers');

const boardsRouter = express.Router();

boardsRouter.route('/').get(getBoards).post(addNewBoardAndColumns);

boardsRouter
	.route('/:board_id')
	.get(getBoardById)
	.patch(patchBoardsAndColumns)
	.delete(deleteBoardById);

boardsRouter
	.route('/:board_id/columns')
	.get(getColumnsByBoardId)
	.patch(patchColumnsByBoardId);

module.exports = boardsRouter;
