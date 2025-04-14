const format = require('pg-format');
const db = require('../connection');
const { formatData } = require('./utils');
const { hashPassword, fetchAvatarUrl } = require('../../utils/helper');

const seed = async ({ data }) => {
	await db.query(`DROP TABLE IF EXISTS subtasks`);
	await db.query(`DROP TABLE IF EXISTS comments`);
	await db.query(`DROP TABLE IF EXISTS tasks`);
	await db.query(`DROP TABLE IF EXISTS columns`);
	await db.query(`DROP TABLE IF EXISTS boards`);
	await db.query(`DROP TABLE IF EXISTS invitations;`);
	await db.query(`DROP TABLE IF EXISTS team_members`);
	await db.query(`DROP TABLE IF EXISTS teams`);
	await db.query(`DROP TABLE IF EXISTS users`);

	await db.query(`CREATE TABLE users (
		user_id SERIAL PRIMARY KEY,
		first_name VARCHAR(50) DEFAULT 'admin',
		last_name VARCHAR(50),
		email VARCHAR(50) DEFAULT 'admin@admin.com',
		password VARCHAR DEFAULT 'null',
		avatar VARCHAR DEFAULT 'https://i.ibb.co/4pDNDk1/avatar.png'
	);`);

	await db.query(`CREATE TABLE teams (
		team_id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL
	);`);

	await db.query(`CREATE TABLE team_members (
		team_member_id SERIAL PRIMARY KEY,
    	user_id INT REFERENCES users(user_id),
    	team_id INT REFERENCES teams(team_id),
    	role VARCHAR(20) DEFAULT 'member',
		UNIQUE (user_id, team_id)
	);`);

	await db.query(`CREATE TABLE invitations (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE, -- FK to teams table
        invited_email VARCHAR(255) NOT NULL,
        inviting_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- FK to users table (inviter)
        token VARCHAR(64) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'accepted', 'declined', 'expired'
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        -- Optional: Removed the complex unique constraint for simplicity, can be added back if needed
        -- UNIQUE (team_id, invited_email, status) WHERE (status = 'pending')
    );`);

	await db.query(`CREATE TABLE boards (
		board_id SERIAL PRIMARY KEY,
		team_id INT REFERENCES teams(team_id),
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
		is_completed BOOLEAN NOT NULL,
		position INT,
    	created_at TIMESTAMP DEFAULT NOW()
  	);`);

	await db.query(`CREATE TABLE comments (
		comment_id SERIAL PRIMARY KEY,
		task_id INT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
		user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
		comment TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT NOW()
	);`);

	await db.query(`CREATE TABLE subtasks (
    	subtask_id SERIAL PRIMARY KEY,
    	task_id INT REFERENCES tasks(task_id),
    	title VARCHAR(250) NOT NULL,
    	is_completed BOOLEAN NOT NULL,
    	created_at TIMESTAMP DEFAULT NOW()
  	);`);

	const firstName = 'Admin';
	const lastName = 'User';

	const avatarUrl = await fetchAvatarUrl(firstName, lastName);

	const newUserQuery = `
  		INSERT INTO users (first_name, last_name, email, password, avatar)
  		VALUES ($1, $2, $3, $4, $5)
  		RETURNING *;
	`;

	const newUserValues = [
		'Admin',
		'User',
		'admin@admin.com',
		hashPassword('password'),
		avatarUrl,
	];

	const newUserResult = await db.query(newUserQuery, newUserValues);
	const userId = newUserResult.rows[0].user_id;

	// Insert a new team into the teams table
	const insertTeamResult = await db.query(`
    	INSERT INTO teams (name)
    	VALUES ('Private Team')
    	RETURNING team_id;
	`);

	const teamId = insertTeamResult.rows[0].team_id;

	// Associate the user with the team in the team_members table
	await db.query(
		`
    	INSERT INTO team_members (user_id, team_id, role)
    	VALUES ($1, $2, 'admin');
	`,
		[userId, teamId]
	);

	// Format and insert data into the 'boards' table
	const formattedData = formatData(data);

	const boardsData = formattedData.boards.map((board) => [board.name, 1]);
	const boardsInsertQuery = format(
		'INSERT INTO boards (name, team_id) VALUES %L RETURNING *',
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

	// Insert data for tasks and reset position for each column
	for (const board of formattedData.boards) {
		for (const column of board.columns) {
			const boardId = boardRows.find((row) => row.name === board.name).board_id;

			// Get the column_id for the current column
			const currentColumnId = columnRows.find(
				(row) => row.board_id === boardId && row.name === column.name
			).column_id;

			let currentPosition = 1;

			for (const taskData of column.tasks) {
				// Insert data for tasks and set the position
				const taskInsertQuery = format(
					'INSERT INTO tasks (column_id, title, description, status, is_completed, position) VALUES (%L, %L, %L, %L, %L, %L) RETURNING *',
					currentColumnId,
					taskData.title,
					taskData.description,
					taskData.status,
					false,
					currentPosition
				);

				const taskRows = await db.query(taskInsertQuery).then((result) => {
					return result.rows;
				});

				currentPosition++;

				// Insert data for subtasks
				for (const subtaskData of taskData.subtasks) {
					const subtaskInsertQuery = format(
						'INSERT INTO subtasks (task_id, title, is_completed) VALUES (%L, %L, %L) RETURNING *',
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
