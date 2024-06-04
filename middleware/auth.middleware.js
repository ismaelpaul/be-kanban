const jwt = require('jsonwebtoken');
const { checkUserExistsById } = require('../models/auth.models');

exports.isAuthenticated = async (req, res, next) => {
	try {
		const token = req.cookies.token;

		if (!token) {
			return res.status(401).json({ message: 'Not authorized, please log in' });
		}

		const verified = jwt.verify(token, process.env.JWT_SECRET);

		const user_id = verified.user_id;

		if (!user_id) {
			return res.status(401).json({ message: 'Invalid token' });
		}

		const existingUser = await checkUserExistsById(user_id);

		if (!existingUser.userExists) {
			return res.status(401).json({ message: 'User not found' });
		}
		req.user = existingUser.user;
		next();
	} catch (error) {
		return res.status(401).send('Not authorized, please log in.');
	}
};
