const express = require('express');
const { getColumns } = require('../controllers/columns.controllers');

const columnsRouter = express.Router();

columnsRouter.route('/').get(getColumns);

module.exports = columnsRouter;
