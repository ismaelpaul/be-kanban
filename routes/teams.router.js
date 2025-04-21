const express = require('express');
const {
	getTeamByUserId,
	getBoardsByTeamId,
	addTeam,
	patchTeamNameById,
	addTeamInvitation,
} = require('../controllers/teams.controllers');
const { isAuthenticated } = require('../middleware/auth.middleware');

const teamsRouter = express.Router();

teamsRouter.route('/').get(isAuthenticated, getTeamByUserId);
teamsRouter.route('/:team_id/boards').get(getBoardsByTeamId);
teamsRouter.route('/').post(isAuthenticated, addTeam);
teamsRouter.route('/:team_id').patch(patchTeamNameById);
teamsRouter
	.route('/:team_id/invitations')
	.post(isAuthenticated, addTeamInvitation);

module.exports = teamsRouter;
