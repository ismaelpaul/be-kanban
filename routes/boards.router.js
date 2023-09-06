const express = require('express');
const {
	getBoards,
	getBoardById,
} = require('../controllers/boards.controllers');

const boardsRouter = express.Router();

boardsRouter.route('/').get(getBoards);

boardsRouter.route('/:board_id').get(getBoardById);

module.exports = boardsRouter;
