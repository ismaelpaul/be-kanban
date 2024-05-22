const { checkUserExistsByEmail } = require('../models/auth.models');
const {
	insertUser,
	checkEmailExists,
	selectUserById,
} = require('../models/user.models');
const {
	hashPassword,
	generateToken,
	comparePassword,
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

exports.registerUser = async (req, res) => {
	const { firstName, lastName, email, password } = req.body;

	const existingUser = await checkUserExistsByEmail(email);

	if (!existingUser.userExists) {
		const hashedPassword = hashPassword(password);
		insertUser(firstName, lastName, email, hashedPassword).then((user) => {
			if (user) {
				const token = generateToken(user.user_id);

				res.cookie('token', token, {
					path: '/',
					httpOnly: true,
					expires: new Date(Date.now() + 1000 * 86400), //1 day,
					sameSite: 'none',
					secure: true,
				});

				res.status(201).send(user);
			} else {
				res.status(400).send('Invalid user data');
			}
		});
	} else {
		res.status(400).send('User has already been registered');
	}
};

exports.checkEmail = async (req, res) => {
	const { email } = req.query;

	const userExists = await checkEmailExists(email);

	res.status(200).send(userExists);
};
