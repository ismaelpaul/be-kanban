const {
	selectInvitationByToken,
	updateInvitationStatus,
} = require('../models/invitations.models');
const {
	selectTeamById,
	insertTeamMembersIntoTeam,
} = require('../models/teams.models');
const { selectUserById } = require('../models/user.models');

exports.verifyInvitation = async (req, res) => {
	const { token } = req.params;

	try {
		const invitation = await selectInvitationByToken(token);

		if (
			!invitation ||
			invitation.status !== 'pending' ||
			invitation.expires_at < new Date()
		) {
			// Update status to 'expired'
			if (
				invitation &&
				invitation.status === 'pending' &&
				invitation.expires_at < new Date()
			) {
				await db.updateInvitationStatus(token, 'expired');
			}
			return res
				.status(404)
				.json({ message: 'Invalid or expired invitation link.' });
		}

		const team = await selectTeamById(invitation.team_id);
		const inviter = await selectUserById(invitation.inviting_user_id);

		if (!team || !inviter) {
			console.error(`Data inconsistency for token ${token}`);
			return res.status(404).json({ message: 'Invitation data not found.' });
		}

		res.json({
			teamName: team.name,
			inviterName: `${inviter.first_name} ${inviter.last_name}`,
			inviterEmail: inviter.email,
			invitedEmail: invitation.invited_email,
		});
	} catch (error) {
		console.error('Verify token error:', error);
		res.status(500).json({ message: 'Error verifying invitation.' });
	}
};

exports.acceptInvitation = async (req, res) => {
	const { token } = req.params;
	const user_id = req.user.user_id;

	try {
		const invitation = await selectInvitationByToken(token);

		if (!invitation || invitation.status !== 'pending') {
			return res
				.status(404)
				.json({ message: 'Invalid or expired invitation link.' });
		}

		await insertTeamMembersIntoTeam(user_id, invitation.team_id);
		await updateInvitationStatus(token, 'accepted');

		res.status(200).json({ message: 'Invitation accepted successfully.' });
	} catch (error) {
		console.error('Accept token error:', error);
		res.status(500).json({ message: 'Error accepting invitation.' });
	}
};

exports.declineInvitation = async (req, res) => {
	const { token } = req.params;

	try {
		const invitation = await selectInvitationByToken(token);

		if (!invitation || invitation.status !== 'pending') {
			return res
				.status(404)
				.json({ message: 'Invalid or expired invitation link.' });
		}

		await updateInvitationStatus(token, 'declined');

		res.status(200).json({ message: 'Invitation declined successfully.' });
	} catch (error) {
		console.error('Decline token error:', error);
		res.status(500).json({ message: 'Error declining invitation.' });
	}
};
