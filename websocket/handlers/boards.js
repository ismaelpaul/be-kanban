const { insertBoard } = require('../../models/boards.models');
const { insertColumn } = require('../../models/columns.models');

module.exports = {
	ADD_NEW_BOARD: async (payload) => {
		const { team_id } = payload;
		const { name } = payload.board;

		try {
			const newBoard = await insertBoard(team_id, name);

			const columns = payload.board.columns;

			const nonEmptyColumns = columns.filter(
				(column) => column.name.trim() !== ''
			);

			const board_id = newBoard.board_id;

			if (nonEmptyColumns.length > 0) {
				const columnPromises = nonEmptyColumns.map((column) => {
					const columnNameCapitalised = column.name
						.trim()
						.split(' ')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ');

					return insertColumn({ board_id, name: columnNameCapitalised });
				});

				await Promise.all(columnPromises);
			}
			return {
				type: 'BOARD_ADDED',
				board: newBoard,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
};
