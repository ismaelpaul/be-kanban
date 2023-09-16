const express = require('express');
const {
	getColumns,
	getTasksByColumnId,
} = require('../controllers/columns.controllers');

const columnsRouter = express.Router();

columnsRouter.route('/').get(getColumns);

columnsRouter.route('/:column_id/tasks').get(getTasksByColumnId);

module.exports = columnsRouter;
