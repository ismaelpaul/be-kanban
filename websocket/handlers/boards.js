const { insertBoard, updateBoardById } = require('../../models/boards.models');
const {
	insertColumn,
	updateColumnNameById,
	removeColumnsById,
} = require('../../models/columns.models');

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
	UPDATE_BOARD_INFO: async (payload) => {
		const { board_id, name } = payload.board;

		const columnsToDelete = payload.columns.toDelete;
		const columnsToAdd = payload.columns.toAdd;
		const columnsToEdit = payload.columns.toEdit;

		try {
			if (board_id && name) {
				await updateBoardById(board_id, name);
			}

			// Handle deleted subtasks
			if (columnsToDelete.length > 0) {
				for (const column_id of columnsToDelete) {
					await removeColumnsById(column_id);
				}
			}

			// Handle new subtasks
			if (columnsToAdd.length > 0) {
				for (const column of columnsToAdd) {
					await insertColumn(board_id, column.name);
				}
			}

			// Handle edited subtasks
			if (columnsToEdit.length > 0) {
				for (const column of columnsToEdit) {
					await updateColumnNameById(column.column_id, column.name);
				}
			}

			return {
				type: 'BOARD_INFO_UPDATED',
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
};
