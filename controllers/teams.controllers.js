const { use } = require('passport');
const { checkUserExistsByEmail } = require('../models/auth.models');
const { insertBoard } = require('../models/boards.models');
const {
	selectTeamByUserId,
	selectBoardsByTeamId,
	insertTeam,
	insertTeamMembersIntoTeam,
	updateTeamNameById,
	checkTeamMember,
	selectTeamNameById,
} = require('../models/teams.models');
const {
	pendingInviteCheck,
	insertTeamInvitation,
} = require('../models/invitations.models');
const crypto = require('crypto');
const { sendTeamInvitationEmail } = require('../services/emailService');

exports.getTeamByUserId = (req, res) => {
	const user_id = req.user.user_id;

	selectTeamByUserId(user_id).then((teams) => {
		res.status(200).send({ teams });
	});
};

exports.getBoardsByTeamId = (req, res) => {
	const { team_id } = req.params;

	selectBoardsByTeamId(team_id).then((boards) => {
		res.status(200).send({ boards });
	});
};

exports.addTeam = (req, res) => {
	const { name } = req.body;

	let createdTeam;
	let createdBoard;

	insertTeam(name)
		.then((team) => {
			createdTeam = team;
			const team_id = team.team_id;

			return insertBoard(team_id, 'New Board');
		})
		.then((board) => {
			createdBoard = board;

			const user_id = req.user.user_id;
			const team_id = createdTeam.team_id;
			return insertTeamMembersIntoTeam(user_id, team_id, 'admin');
		})
		.then(() => {
			res.status(201).json({
				message: 'Team created successfully',
				team: {
					...createdTeam,
					board: createdBoard,
				},
			});
		})
		.catch((err) => {
			console.error(err);
			res
				.status(500)
				.json({ message: 'Error creating team', error: err.message });
		});
};

exports.patchTeamNameById = (req, res) => {
	const { team_id } = req.params;
	const { name } = req.body;

	updateTeamNameById(team_id, name)
		.then((team) => {
			res.status(200).send({ team });
		})
		.catch((err) => {
			res.status(500).send({ message: 'Error updating team name', error: err });
		});
};

exports.addTeamInvitation = async (req, res) => {
	console.log('Email From:', process.env.EMAIL_FROM);
	console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY);

	const invitingUser = req.user;
	const { team_id } = req.params;
	const { email } = req.body;

	const invitingUserId = invitingUser.user_id;

	if (!invitingUser) {
		return res.status(401).json({ message: 'Authentication required.' });
	}
	if (!team_id) {
		return res.status(400).json({ message: 'Team ID is required.' });
	}

	if (isNaN(team_id)) {
		return res.status(400).json({ message: 'Invalid Team ID format.' });
	}
	if (!email) {
		return res.status(400).json({ message: 'Email is required.' });
	}

	try {
		const memberCheck = await checkTeamMember(invitingUserId, team_id);

		if (!memberCheck) {
			return res.status(403).json({
				message: 'You do not have permission to invite users to this team.',
			});
		}

		const invitedUserExists = await checkUserExistsByEmail(email);

		if (invitedUserExists.userExists) {
			const invitedUserId = invitedUserExists.user.user_id;
			const memberCheck = await checkTeamMember(invitedUserId, team_id);

			if (memberCheck) {
				return res.status(400).json({
					message: 'User is already a member of this team.',
				});
			}
		}

		const inviteCheck = await pendingInviteCheck(email, team_id);

		if (inviteCheck) {
			return res.status(409).json({
				message:
					'An invitation is already pending for this email address for this team.',
			});
		}

		// === Generate Token & Expiry ===
		const token = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours expiry

		await insertTeamInvitation(
			team_id,
			email,
			invitingUserId,
			token,
			'pending',
			expiresAt
		);

		const inviterName =
			invitingUser.name || invitingUser.email || `User #${invitingUserId}`;

		const teamData = await selectTeamNameById(team_id);
		const teamName = teamData?.name || 'Unnamed Team';

		// === Send Email ===
		await sendTeamInvitationEmail(email, inviterName, teamName, token);

		// === Respond Success ===
		res.status(201).json({ message: 'Invitation sent successfully.' });
	} catch (error) {
		console.error('Error creating team invitation:', error);

		if (error.message === 'Failed to send invitation email.') {
			return res
				.status(502)
				.json({ message: 'Invitation created, but failed to send email.' });
		}
		res
			.status(500)
			.json({ message: 'Internal server error while creating invitation.' });
	}
};
