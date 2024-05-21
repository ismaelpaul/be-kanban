const db = require('../db/connection');

exports.insertGoogleOrGithubUser = async (user) => {
	const { first_name, last_name, email, avatar } = user;

	try {
		const result = await db.query(
			`INSERT INTO users (first_name, last_name, email, avatar) VALUES ($1, $2, $3, $4) RETURNING *;`,
			[first_name, last_name, email, avatar]
		);
		return result.rows[0];
	} catch (error) {
		console.error('Error checking user existence:', error);
		throw error;
	}
};

exports.checkUserExistsByEmail = async (email) => {
	try {
		const result = await db.query(
			`SELECT users.user_id, users.first_name, users.last_name, users.email, users.password, users.avatar FROM users WHERE email = $1;`,
			[email]
		);

		const userExists = result.rows.length > 0;

		return { userExists, user: userExists ? result.rows[0] : null };
	} catch (error) {
		console.error('Error checking user existence:', error);
		throw error;
	}
};

exports.checkUserExistsById = async (user_id) => {
	try {
		const result = await db.query(
			`SELECT users.user_id, users.first_name, users.last_name, users.email, users.avatar FROM users WHERE user_id = $1;`,
			[user_id]
		);

		const userExists = result.rows.length > 0;

		return { userExists, user: userExists ? result.rows[0] : null };
	} catch (error) {
		console.error('Error checking user existence:', error);
		throw error;
	}
};
