const express = require('express');
const {
	getTeamByUserId,
	getBoardsByTeamId,
	addTeam,
} = require('../controllers/teams.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

const teamsRouter = express.Router();

teamsRouter.route('/').get(isAuthenticated, getTeamByUserId);
teamsRouter.route('/:team_id/boards').get(getBoardsByTeamId);
teamsRouter.route('/').post(isAuthenticated, addTeam);

module.exports = teamsRouter;
