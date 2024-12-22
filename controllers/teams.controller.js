const {
	selectTeamByUserId,
	selectBoardsByTeamId,
} = require('../models/teams.models');

exports.getTeamByUserId = async (req, res) => {
	const user_id = req.user.user_id;

	selectTeamByUserId(user_id).then((teams) => {
		res.status(200).send({ teams });
	});
};

exports.getBoardsByTeamId = async (req, res) => {
	const { team_id } = req.params;

	selectBoardsByTeamId(team_id).then((boards) => {
		res.status(200).send({ boards });
	});
};
