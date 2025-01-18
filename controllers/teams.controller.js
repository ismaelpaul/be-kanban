const { insertBoard } = require('../models/boards.models');
const {
	selectTeamByUserId,
	selectBoardsByTeamId,
	insertTeam,
	insertTeamMembersIntoTeam,
} = require('../models/teams.models');

exports.getTeamByUserId = (req, res) => {
	const user_id = req.user.user_id;

	selectTeamByUserId(user_id).then((teams) => {
		res.status(200).send({ teams });
	});
};

exports.getBoardsByTeamId = (req, res) => {
	const { team_id } = req.params;

	selectBoardsByTeamId(team_id).then((boards) => {
		res.status(200).send({ boards });
	});
};

exports.addTeam = (req, res) => {
	const { name } = req.body;

	let createdTeam;
	let createdBoard;

	insertTeam(name)
		.then((team) => {
			createdTeam = team;
			const team_id = team.team_id;

			return insertBoard(team_id, 'New Board');
		})
		.then((board) => {
			createdBoard = board;

			const user_id = req.user.user_id;
			const team_id = createdTeam.team_id;
			return insertTeamMembersIntoTeam(user_id, team_id, 'admin');
		})
		.then(() => {
			res.status(201).json({
				message: 'Team created successfully',
				team: {
					...createdTeam,
					board: createdBoard,
				},
			});
		})
		.catch((err) => {
			console.error(err);
			res
				.status(500)
				.json({ message: 'Error creating team', error: err.message });
		});
};
