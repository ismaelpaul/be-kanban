const { checkUserExistsByEmail } = require('../models/auth.models');
const { insertBoard } = require('../models/boards.models');
const {
	insertTeam,
	insertTeamMembersIntoTeam,
} = require('../models/teams.models');
const {
	insertUser,
	checkEmailExists,
	selectUserById,
	selectUsersByTeamId,
} = require('../models/user.models');
const {
	hashPassword,
	generateToken,
	comparePassword,
	fetchAvatarUrl,
} = require('../utils/helper');

exports.getUser = (req, res, next) => {
	const user_id = req.user.user_id;

	selectUserById(user_id)
		.then((user) => {
			if (!user) {
				return res.status(404).send({ error: 'User not found' });
			}
			res.status(200).send({ user });
		})
		.catch(next);
};

exports.getUserById = (req, res, next) => {
	const { user_id } = req.body;
	selectUserById(user_id)
		.then((users) => {
			res.status(200).send({ users });
		})
		.catch(next);
};

exports.loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Please add email and password.' });
	}

	const existingUser = await checkUserExistsByEmail(email);

	if (!existingUser.userExists) {
		return res
			.status(400)
			.json({ message: 'User not found, please register.' });
	}

	const passwordIsCorrect = await comparePassword(
		password,
		existingUser.user.password
	);

	if (!passwordIsCorrect) {
		return res.status(400).json({ message: 'Invalid email or password' });
	}

	// Generate token
	const token = generateToken(existingUser.user.user_id);

	// Send HTTP-only cookie
	res.cookie('token', token, {
		path: '/',
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 86400), //1 day,
		sameSite: 'none',
		secure: true,
	});

	const { user_id, first_name, last_name, avatar } = existingUser.user;

	return res.status(200).json({
		user_id,
		first_name,
		last_name,
		email,
		avatar,
		token,
	});
};

exports.logoutUser = (req, res) => {
	res.cookie('token', '', {
		path: '/',
		httpOnly: true,
		expires: new Date(0), // expires cookie
		sameSite: 'none',
		secure: true,
	});
	return res.status(200).json({ message: 'Logged out successfully' });
};

exports.registerUser = async (req, res) => {
	const { firstName, lastName, email, password } = req.body;

	try {
		const existingUser = await checkUserExistsByEmail(email);
		const avatarUrl = await fetchAvatarUrl(firstName, lastName);

		if (!existingUser.userExists) {
			const hashedPassword = hashPassword(password);

			const user = await insertUser(
				firstName,
				lastName,
				email,
				hashedPassword,
				avatarUrl
			);

			if (user) {
				const newTeam = await insertTeam('Private Team');

				if (newTeam) {
					await insertTeamMembersIntoTeam(
						user.user_id,
						newTeam.team_id,
						(role = 'admin')
					);
					await insertBoard(newTeam.team_id, 'New Board');
				}

				const token = generateToken(user.user_id);

				res.cookie('token', token, {
					path: '/',
					httpOnly: true,
					expires: new Date(Date.now() + 1000 * 86400), // 1 day
					sameSite: 'none',
					secure: true,
				});

				return res.status(201).send(user);
			} else {
				return res.status(400).send('Invalid user data');
			}
		} else {
			return res.status(400).send('User has already been registered');
		}
	} catch (error) {
		console.error('Error during user registration:', error);
		return res.status(500).send('Internal Server Error');
	}
};

exports.checkEmail = async (req, res) => {
	const { email } = req.query;

	const userExists = await checkEmailExists(email);

	res.status(200).send(userExists);
};

exports.getUsersByTeamId = async (req, res) => {
	const { team_id } = req.params;

	selectUsersByTeamId(team_id).then((teamMembers) => {
		res.status(200).send({ teamMembers });
	});
};
