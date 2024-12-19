const express = require('express');
const { getTeamByUserId } = require('../controllers/teams.controller');

const teamsRouter = express.Router();

teamsRouter.route('/').get(getTeamByUserId);

module.exports = teamsRouter;
