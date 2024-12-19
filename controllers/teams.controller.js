const { selectTeamByUserId } = require('../models/teams.models');

exports.getTeamByUserId = async (req, res) => {
	const { user_id } = req.user.user_id;

	selectTeamByUserId(user_id).then((team) => {
		res.status(200).send({ team });
	});
};
