const {
	insertBoard,
	updateBoardById,
	selectColumnsByBoardId,
	removeBoardById,
} = require('../../models/boards.models');
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

					return insertColumn(board_id, columnNameCapitalised);
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
			let updatedBoard = null;
			const updatedColumns = [];

			// Update the board name if provided
			if (board_id && name) {
				updatedBoard = await updateBoardById(board_id, name);
			}

			// Handle deleted columns
			if (columnsToDelete.length > 0) {
				for (const column_id of columnsToDelete) {
					await removeColumnsById(column_id);
				}
			}

			// Handle new columns
			if (columnsToAdd.length > 0) {
				for (const column of columnsToAdd) {
					const newColumn = await insertColumn(board_id, column.name);
					updatedColumns.push(newColumn); // Add the new column to the result
				}
			}

			// Handle edited columns
			if (columnsToEdit.length > 0) {
				for (const column of columnsToEdit) {
					const updatedColumn = await updateColumnNameById(
						column.column_id,
						column.name
					);
					updatedColumns.push(updatedColumn); // Add the updated column to the result
				}
			}

			// Fetch remaining columns
			const existingColumns = await selectColumnsByBoardId(board_id);
			updatedColumns.push(
				...existingColumns.filter(
					(col) =>
						!columnsToDelete.includes(col.column_id) &&
						!updatedColumns.find(
							(updated) => updated.column_id === col.column_id
						)
				)
			);

			return {
				type: 'BOARD_INFO_UPDATED',
				board: updatedBoard ? updatedBoard : {},
				columns: updatedColumns ? updatedColumns : {},
			};
		} catch (error) {
			console.error('Error updating board info:', error);
			throw error;
		}
	},
	DELETE_BOARD: async (payload) => {
		const { board_id } = payload;

		try {
			const deletedBoard = await removeBoardById(board_id);

			return {
				type: 'BOARD_DELETED',
				deletedBoard,
			};
		} catch (error) {
			console.error('Error deleting board:', error);
			throw error;
		}
	},
};
