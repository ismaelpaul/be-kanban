const jwt = require('jsonwebtoken');
const { checkUserExistsById } = require('../models/auth.models');

exports.isAuthenticated = async (req, res, next) => {
	try {
		const token = req.cookies.token;

		if (!token) {
			console.log('error token');
			res.status(401);
			throw new Error('Not authorized, please log in');
		}
		const verified = jwt.verify(token, process.env.JWT_SECRET);

		const existingUser = await checkUserExistsById(verified);

		if (!existingUser.userExists) {
			res.status(401);
			throw new Error('User not found');
		}
		req.user = existingUser.user;
		next();
	} catch (error) {
		res.status(401).send('Not authorized, please log in.');
	}
};
