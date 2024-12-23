const db = require('../db/connection');

exports.selectUserById = (user_id) => {
	return db
		.query(
			`SELECT users.user_id, users.first_name, users.last_name, users.email, users.avatar FROM users WHERE user_id = $1;`,
			[user_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.insertUser = (first_name, last_name, email, password) => {
	return db
		.query(
			`INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING users.user_id, users.first_name, users.last_name, users.email, users.avatar;`,
			[first_name, last_name, email, password]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.checkEmailExists = (email) => {
	return db
		.query(`SELECT EXISTS (SELECT 1 FROM users WHERE email = ($1))`, [email])
		.then((result) => {
			return result.rows[0].exists;
		});
};

exports.selectUsersByTeamId = async (team_id) => {
	return await db
		.query(
			`SELECT users.user_id, users.first_name, users.last_name, users.avatar, team_members.role FROM team_members JOIN users ON team_members.user_id = users.user_id WHERE team_members.team_id = $1;`,
			[team_id]
		)
		.then((result) => {
			return result.rows;
		});
};
