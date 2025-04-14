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
                team_members.user_id = $1
			ORDER BY 
                teams.team_id;`,
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

exports.insertTeam = async (name) => {
	return await db
		.query(
			`
  INSERT INTO teams (name)
  VALUES ($1)
  RETURNING *;
`,
			[name]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.insertTeamMembersIntoTeam = async (
	user_id,
	team_id,
	role = 'member'
) => {
	return await db
		.query(
			`WITH check_user AS (
                SELECT * 
                FROM team_members 
                WHERE user_id = $1 AND team_id = $2
            ),
            insert_user AS (
                INSERT INTO team_members (user_id, team_id, role)
                SELECT $1, $2, $3
                WHERE NOT EXISTS (SELECT 1 FROM check_user)
                RETURNING *
            )
            SELECT t.* 
            FROM teams t
            WHERE t.team_id = $2;`,
			[user_id, team_id, role]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.updateTeamNameById = async (team_id, name) => {
	return await db
		.query(
			`
  UPDATE teams
  SET name = $2
  WHERE team_id = $1
  RETURNING *;
`,
			[team_id, name]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.checkTeamMember = async (user_id, team_id) => {
	return await db
		.query(
			`
  SELECT * 
  FROM team_members 
  WHERE user_id = $1 AND team_id = $2;
`,
			[user_id, team_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.selectTeamNameById = async (team_id) => {
	return await db
		.query(
			`
  			SELECT name 
  			FROM teams 
  			WHERE team_id = $1;
			`,
			[team_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};
