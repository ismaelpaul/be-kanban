const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.hashPassword = (password) => {
	const salt = bcrypt.genSaltSync();
	return bcrypt.hashSync(password, salt);
};

exports.comparePassword = (raw, hash) => {
	return bcrypt.compareSync(raw, hash);
};

exports.generateToken = (user_id) => {
	return jwt.sign(user_id, process.env.JWT_SECRET);
};
