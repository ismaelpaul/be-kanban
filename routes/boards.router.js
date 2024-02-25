const express = require('express');
const {
	getBoards,
	getBoardById,
	getColumnsByBoardId,
	deleteBoardById,
	addNewBoardAndColumns,
	patchColumnsByBoardId,
	addColumnsByBoardId,
	patchBoardNameById,
} = require('../controllers/boards.controllers');

const boardsRouter = express.Router();

boardsRouter.use((req, res, next) => {
	if (req.user) next();
	else res.status(401).send({ message: 'Not authorized, please log in' });
});

boardsRouter.route('/').get(getBoards).post(addNewBoardAndColumns);

boardsRouter
	.route('/:board_id')
	.get(getBoardById)
	.patch(patchBoardNameById)
	.delete(deleteBoardById)
	.post(addColumnsByBoardId);

boardsRouter
	.route('/:board_id/columns')
	.get(getColumnsByBoardId)
	.patch(patchColumnsByBoardId);

module.exports = boardsRouter;
