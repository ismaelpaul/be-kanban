const bcrypt = require('bcrypt');

exports.hashPassword = (password) => {
	const salt = bcrypt.genSaltSync();
	return bcrypt.hashSync(password, salt);
};

exports.comparePassword = (raw, hash) => {
	return bcrypt.compareSync(raw, hash);
};
