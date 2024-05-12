const { checkUserExistsByEmail } = require('../models/auth.models');
const { selectUsers, insertUser } = require('../models/user.models');
const { hashPassword, generateToken } = require('../utils/helper');

exports.getUsers = async (req, res, next) => {
	selectUsers()
		.then((users) => {
			res.status(200).send({ users });
		})
		.catch(next);
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
