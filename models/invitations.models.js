const db = require('../db/connection');

exports.pendingInviteCheck = async (email, team_id) => {
	return await db
		.query(
			`SELECT id FROM invitations WHERE invited_email = $1 AND team_id = $2 AND status = 'pending' AND expires_at > NOW()`,
			[email, team_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.insertTeamInvitation = async (
	team_id,
	email,
	invitingUserId,
	token,
	status = 'pending',
	expiresAt
) => {
	return await db
		.query(
			`INSERT INTO invitations (team_id, invited_email, inviting_user_id, token, status, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
			[team_id, email, invitingUserId, token, status, expiresAt]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.selectInvitationByToken = async (token) => {
	return db
		.query(`SELECT * FROM invitations WHERE token = $1`, [token])
		.then((result) => {
			return result.rows[0];
		});
};

exports.updateInvitationStatus = async (token, status) => {
	return db.query(
		`UPDATE invitations SET status = $1 WHERE token = $2 RETURNING *`,
		[status, token]
	);
};
