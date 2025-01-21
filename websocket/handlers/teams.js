const { updateTeamNameById } = require('../../models/teams.models');

module.exports = {
	UPDATE_TEAM: async (payload) => {
		const { team_id, name } = payload.team;

		console.log(team_id, name);

		try {
			const updatedTeam = await updateTeamNameById(team_id, name);

			console.log(updatedTeam, '<<<< updated team');

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
};
