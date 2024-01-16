const express = require('express');
const {
	getColumns,
	getTasksByColumnId,
	deleteColumnsByColumnId,
} = require('../controllers/columns.controllers');

const columnsRouter = express.Router();

columnsRouter.route('/').get(getColumns).delete(deleteColumnsByColumnId);

columnsRouter.route('/:column_id/tasks').get(getTasksByColumnId);

module.exports = columnsRouter;
