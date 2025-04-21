const express = require('express');
const {
	verifyInvitation,
	acceptInvitation,
	declineInvitation,
} = require('../controllers/invitations.controllers');
const { isAuthenticated } = require('../middleware/auth.middleware');

const invitationsRouter = express.Router();

invitationsRouter.route('/verify/:token').get(verifyInvitation);
invitationsRouter
	.route('/:token/accept')
	.post(isAuthenticated, acceptInvitation);
invitationsRouter
	.route('/:token/reject')
	.post(isAuthenticated, declineInvitation);

module.exports = invitationsRouter;
