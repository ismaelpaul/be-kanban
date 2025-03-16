const { insertColumn } = require('../../models/columns.models');

module.exports = {
	ADD_NEW_COLUMN: async (payload) => {
		const board_id = payload.boardId;
		const columnName = payload.column;

		try {
			const newColumn = await insertColumn(board_id, columnName);

			return {
				type: 'COLUMN_ADDED',
				column: newColumn,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
};
