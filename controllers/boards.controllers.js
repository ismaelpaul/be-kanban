const {
	selectBoards,
	selectBoardsById,
	selectColumnsByBoardId,
	removeBoardById,
	insertBoard,
	updateBoardById,
} = require('../models/boards.models');
const {
	insertColumn,
	updateColumnNameById,
} = require('../models/columns.models');

exports.getBoards = (req, res, next) => {
	const user_id = req.user.user_id;
	selectBoards(user_id)
		.then((boards) => {
			res.status(200).send({ boards });
		})
		.catch(next);
};

exports.getBoardById = (req, res, next) => {
	const { board_id } = req.params;
	selectBoardsById(board_id)
		.then((board) => {
			res.status(200).send({ board });
		})
		.catch(next);
};

exports.deleteBoardById = (req, res, next) => {
	const { board_id } = req.params;

	removeBoardById(board_id)
		.then((board) => {
			res.status(204).send({ board });
		})
		.catch(next);
};

exports.getColumnsByBoardId = (req, res, next) => {
	const { board_id } = req.params;

	selectColumnsByBoardId(board_id)
		.then((columns) => {
			res.status(200).send({ columns });
		})
		.catch(next);
};

exports.addNewBoardAndColumns = (req, res, next) => {
	const newBoard = req.body;
	const { name } = newBoard;
	const user_id = req.user.user_id;

	const boardNameCapitalised = name
		.trim()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	insertBoard(user_id, boardNameCapitalised)
		.then((board) => {
			const board_id = board.board_id;
			const columns = newBoard.columns;

			const nonEmptyColumns = columns.filter(
				(column) => column.name.trim() !== ''
			);

			if (nonEmptyColumns.length > 0) {
				const columnPromises = nonEmptyColumns.map((column) => {
					const columnNameCapitalised = column.name
						.trim()
						.split(' ')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ');

					return insertColumn({ board_id, name: columnNameCapitalised });
				});

				Promise.all(columnPromises)
					.then(() => res.status(201).send({ board }))
					.catch(next);
			} else {
				res.status(201).send({ board });
			}
		})
		.catch(next);
};

exports.patchBoardNameById = (req, res, next) => {
	const { name } = req.body;
	const { board_id } = req.params;

	updateBoardById(board_id, name).then((board) => res.status(200).send(board));
};

exports.patchColumnsByBoardId = (req, res, next) => {
	const columns = req.body;

	const columnsPromises = columns.map((column) => {
		const name = column.name;
		const column_id = column.column_id;

		return updateColumnNameById(column_id, name);
	});

	Promise.all(columnsPromises)
		.then(() => res.status(200).send({ columns }))
		.catch(next);
};

exports.addColumnsByBoardId = async (req, res, next) => {
	const { board_id } = req.params;
	const columns = req.body;

	try {
		const insertedColumns = [];
		for (const column of columns) {
			const columnNameCapitalised = column.name
				.trim()
				.split(' ')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');

			const insertedColumn = await insertColumn(
				board_id,
				columnNameCapitalised
			);
			insertedColumns.push(insertedColumn);
		}

		res.status(201).send(insertedColumns);
	} catch (err) {
		next(err);
	}
};
