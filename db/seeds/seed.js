const format = require('pg-format');
const db = require('../connection');
const { formatData } = require('./utils');

const seed = async ({ data }) => {
	await db.query(`DROP TABLE IF EXISTS subtasks`);
	await db.query(`DROP TABLE IF EXISTS tasks`);
	await db.query(`DROP TABLE IF EXISTS columns`);
	await db.query(`DROP TABLE IF EXISTS boards`);
	await db.query(`DROP TABLE IF EXISTS users`);

	await db.query(`CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) DEFAULT 'admin',
    last_name VARCHAR(50),
    email VARCHAR(50) DEFAULT 'admin@admin.com',
    password VARCHAR DEFAULT 'password'
  );`);

	await db.query(`CREATE TABLE boards (
    board_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    name VARCHAR(50) NOT NULL
  );`);

	await db.query(`CREATE TABLE columns (
    column_id SERIAL PRIMARY KEY,
    board_id INT REFERENCES boards(board_id),
    name VARCHAR(50) NOT NULL
  );`);

	await db.query(`CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    column_id INT REFERENCES columns(column_id),
    title VARCHAR(250) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(25) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );`);

	await db.query(`CREATE TABLE subtasks (
    subtask_id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(task_id),
    title VARCHAR(250) NOT NULL,
    isCompleted BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );`);

	const formattedData = formatData(data);

	// Format and insert data into the 'boards' table
	const boardsData = formattedData.boards.map((board) => [board.name]);
	const boardsInsertQuery = format(
		'INSERT INTO boards (name) VALUES %L RETURNING *',
		boardsData
	);
	const boardRows = await db
		.query(boardsInsertQuery)
		.then((result) => result.rows);

	// Format and insert data into the 'columns' table
	const columnsData = [];
	formattedData.boards.forEach((board) => {
		const boardId = boardRows.find((row) => row.name === board.name).board_id;
		columnsData.push(...board.columns.map((column) => [boardId, column.name]));
	});

	const columnsInsertQuery = format(
		'INSERT INTO columns (board_id, name) VALUES %L RETURNING *',
		columnsData
	);

	const columnRows = await db
		.query(columnsInsertQuery)
		.then((result) => result.rows);

	// Insert data for tasks and subtasks
	for (const board of formattedData.boards) {
		for (const column of board.columns) {
			for (const taskData of column.tasks) {
				// Insert data for tasks
				const taskInsertQuery = format(
					'INSERT INTO tasks (column_id, title, description, status) VALUES (%L, %L, %L, %L) RETURNING *',
					columnRows.find((row) => row.name === column.name).column_id,
					taskData.title,
					taskData.description,
					taskData.status
				);
				const taskRows = await db
					.query(taskInsertQuery)
					.then((result) => result.rows);

				// Insert data for subtasks
				for (const subtaskData of taskData.subtasks) {
					const subtaskInsertQuery = format(
						'INSERT INTO subtasks (task_id, title, isCompleted) VALUES (%L, %L, %L) RETURNING *',
						taskRows[0].task_id,
						subtaskData.title,
						subtaskData.isCompleted
					);
					await db.query(subtaskInsertQuery).then((result) => result.rows);
				}
			}
		}
	}
};

module.exports = seed;
