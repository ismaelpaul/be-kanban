const db = require('../db/connection');

exports.selectTeamByUserId = async (user_id) => {
	return await db
		.query(
			`SELECT 
                teams.team_id, 
                teams.name
            FROM 
                team_members
            JOIN 
                teams ON team_members.team_id = teams.team_id
            WHERE 
                team_members.user_id = $1;`,
			[user_id]
		)
		.then((result) => {
			return result.rows;
		});
};

exports.selectBoardsByTeamId = async (team_id) => {
	return await db
		.query(
			`SELECT 
                boards.board_id, 
                boards.name
            FROM 
                boards
            WHERE 
                boards.team_id = $1
			ORDER BY
				boards.board_id;`,
			[team_id]
		)
		.then((result) => {
			return result.rows;
		});
};

exports.getTeamIdByUserId = async (user_id) => {
	return await db.query('SELECT team_id FROM team_members WHERE user_id = $1', [
		user_id,
	]);
};
