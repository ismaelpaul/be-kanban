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
	const payload = { user_id };
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};
