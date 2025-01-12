const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

exports.fetchAvatarUrl = async (first_name, last_name) => {
	try {
		const avatarApiUrl = `https://avatar.iran.liara.run/username?username=${first_name}+${last_name}`;
		const response = await axios.get(avatarApiUrl);
		return response.request.res.responseUrl;
	} catch (error) {
		console.error('Error fetching avatar URL:', error);

		return 'https://i.ibb.co/4pDNDk1/avatar.png';
	}
};
