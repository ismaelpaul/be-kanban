const { selectUsers } = require('../models/users.models');

exports.getUsers = (req, res, next) => {
	selectUsers()
		.then((users) => {
			console.log(users, '<<<< ');
			res.status(200).send({ users });
		})
		.catch(next);
};
