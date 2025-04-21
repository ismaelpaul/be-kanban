const { updateTeamNameById } = require('../../models/teams.models');

module.exports = {
	UPDATE_TEAM: async (payload) => {
		const { team_id, name } = payload.team;

		try {
			const updatedTeam = await updateTeamNameById(team_id, name);

			return {
				type: 'TEAM_UPDATED',
				team: updatedTeam,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
	SWITCH_TEAM: async (payload, ws, teamConnections) => {
		const team_id = payload.teamId;

		if (!team_id) {
			return { type: 'ERROR', message: 'Invalid team_id provided' };
		}

		handleSwitchTeam(team_id, ws, teamConnections);

		return { type: 'TEAM_SWITCHED', payload: { team_id } };
	},
};

const handleSwitchTeam = (newTeamId, ws, teamConnections) => {
	const user_id = ws.user.user_id;

	if (!newTeamId) {
		console.error(`Invalid team_id received from user ${user_id}`);
		return;
	}

	// Remove user from old team
	if (ws.user.team_id) {
		const currentTeamId = ws.user.team_id;
		teamConnections.get(currentTeamId)?.delete(ws);

		if (teamConnections.get(currentTeamId)?.size === 0) {
			teamConnections.delete(currentTeamId);
		}
	}

	// Add user to new team
	if (!teamConnections.has(newTeamId)) {
		teamConnections.set(newTeamId, new Set());
	}
	teamConnections.get(newTeamId).add(ws);

	// Update user's current team
	ws.user.team_id = newTeamId;

	console.log(`User ${user_id} switched to team ${newTeamId}`);
};
