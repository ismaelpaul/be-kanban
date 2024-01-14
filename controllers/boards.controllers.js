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
	updateColumnNameByBoardId,
} = require('../models/columns.models');

exports.getBoards = (req, res, next) => {
	selectBoards()
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
	const user_id = 1; // set this value for now

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

exports.patchBoardsAndColumns = (req, res, next) => {
	const updatedBoard = req.body;
	const { board_id, name, columns } = updatedBoard;

	const capitalizeString = (str) => {
		return str
			.trim()
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	const updateBoardPromise = () => {
		return new Promise((resolve, reject) => {
			if (name !== '') {
				const boardNameCapitalised = capitalizeString(name);

				updateBoardById({ board_id, name: boardNameCapitalised })
					.then((updatedBoard) => {
						resolve(updatedBoard);
					})
					.catch(reject);
			} else {
				resolve(null);
			}
		});
	};

	const updateColumnsPromises = columns
		.filter((column) => column.name.trim() !== '')
		.map((column) => {
			return new Promise((resolve, reject) => {
				const { column_id, name } = column;
				const columnNameCapitalised = capitalizeString(name);

				updateColumnNameById({ column_id, name: columnNameCapitalised })
					.then((updatedColumn) => {
						resolve(updatedColumn);
					})
					.catch(reject);
			});
		});

	Promise.all([updateBoardPromise(), ...updateColumnsPromises])
		.then(([updatedBoard, ...updatedColumns]) => {
			const responseObj = {};

			if (updatedBoard) {
				responseObj.board = updatedBoard;
			}

			responseObj.columns = updatedColumns.filter(Boolean);

			res.status(200).send(responseObj);
		})
		.catch(next);
};

exports.patchColumnsByBoardId = (req, res, next) => {
	const columns = req.body;

	const columnsPromises = columns.map((column) => {
		const name = column.name;
		const column_id = column.column_id;

		return updateColumnNameById(column_id, name);
	});

	Promise.all(columnsPromises)
		.then(() => res.status(201).send({ columns }))
		.catch(next);
};
