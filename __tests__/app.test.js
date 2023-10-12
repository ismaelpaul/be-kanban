const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const devData = require('../db/data/test-data/data.json');

beforeEach(() => seed({ data: devData }));

afterAll(() => db.end());

describe('/api/boards', () => {
	describe('GET', () => {
		test('200: responds with an array of boards objects', () => {
			return request(app)
				.get('/api/boards')
				.expect(200)
				.then((response) => {
					const allBoards = response.body.boards;
					expect(typeof response.body).toBe('object');
					expect(Array.isArray(allBoards)).toBe(true);
					expect(allBoards.length > 0).toBe(true);
					allBoards.forEach((board) => {
						expect(board).toHaveProperty('board_id', expect.any(Number));
						expect(board).toHaveProperty('user_id', expect.any(Number));
						expect(board).toHaveProperty('name', expect.any(String));
					});
				});
		});
	});
	describe('POST', () => {
		test('201: responds with a baord newly added to the database', () => {
			const newBoard = {
				user_id: 1,
				board_name: 'Production',
				columns: [{ column_name: '' }, { column_name: '' }],
			};
			return request(app)
				.post('/api/boards')
				.send(newBoard)
				.expect(201)
				.then((response) => {
					expect(response.body.board).toEqual({
						user_id: 1,
						board_id: 4,
						name: 'Production',
					});
				});
		});
	});
});

describe('/api/boards/:board_id', () => {
	describe('GET', () => {
		test('200: responds with a single matching board', () => {
			return request(app)
				.get('/api/boards/1')
				.expect(200)
				.then((response) => {
					const board = response.body.board;
					expect(board).toEqual({
						board_id: 1,
						user_id: 1,
						name: 'Platform Launch',
					});
				});
		});
		test('400: responds with an error msg when user requests invalid id', () => {
			return request(app)
				.get('/api/boards/invalid')
				.expect(400)
				.then((response) => {
					expect(response.body.msg).toEqual('Invalid ID.');
				});
		});
		test("404: responds with an error msg when user requests id that doesn't exist", () => {
			return request(app)
				.get('/api/boards/32993')
				.expect(404)
				.then((response) => {
					expect(response.body.msg).toEqual('Board not found.');
				});
		});
	});
	describe('DELETE', () => {
		test('204: responds with an empty response body', () => {
			return request(app).delete('/api/boards/1').expect(204);
		});
	});
});

describe('/api/boards/:board_id/columns', () => {
	describe('GET', () => {
		test('200: responds with an array of columns for the given board id', () => {
			return request(app)
				.get('/api/boards/2/columns')
				.expect(200)
				.then((response) => {
					const allColumns = response.body.columns;
					expect(Array.isArray(allColumns)).toBe(true);
					expect(allColumns.length > 0).toBe(true);
					allColumns.forEach((column) => {
						expect(column).toHaveProperty('column_id', expect.any(Number));
						expect(column).toHaveProperty('board_id', expect.any(Number));
						expect(column).toHaveProperty('name', expect.any(String));
					});
				});
		});
		test('400: responds with an error msg when user requests invalid id', () => {
			return request(app)
				.get('/api/boards/invalid/columns')
				.expect(400)
				.then((response) => {
					expect(response.body.msg).toEqual('Invalid ID.');
				});
		});
	});
});

describe('/api/columns', () => {
	describe('GET', () => {
		test('200: responds with an array of columns objects', () => {
			return request(app)
				.get('/api/columns')
				.expect(200)
				.then((res) => {
					const allColumns = res.body.columns;
					expect(typeof res.body).toBe('object');
					expect(Array.isArray(allColumns)).toBe(true);
					expect(allColumns.length > 0).toBe(true);
					allColumns.forEach((board) => {
						expect(board).toHaveProperty('column_id', expect.any(Number));
						expect(board).toHaveProperty('board_id', expect.any(Number));
						expect(board).toHaveProperty('name', expect.any(String));
					});
				});
		});
	});
});

describe('/api/columns/:column_id/tasks', () => {
	describe('GET', () => {
		test('200: responds with an array of tasks for the given column id', () => {
			return request(app)
				.get('/api/columns/3/tasks')
				.expect(200)
				.then((response) => {
					const allTasks = response.body.tasks;
					expect(Array.isArray(allTasks)).toBe(true);
					expect(allTasks.length > 0).toBe(true);
					allTasks.forEach((task) => {
						expect(task).toHaveProperty('task_id', expect.any(Number));
						expect(task).toHaveProperty('column_id', expect.any(Number));
						expect(task).toHaveProperty('title', expect.any(String));
						expect(task).toHaveProperty('description', expect.any(String));
						expect(task).toHaveProperty('status', expect.any(String));
					});
				});
		});
	});
});

describe('/api/users', () => {
	describe('GET', () => {
		test('200: responds with an array of users objects', () => {
			return request(app)
				.get('/api/users')
				.expect(200)
				.then((response) => {
					const allUsers = response.body.users;
					expect(typeof response.body).toBe('object');
					expect(Array.isArray(allUsers)).toBe(true);
					expect(allUsers.length > 0).toBe(true);
					allUsers.forEach((board) => {
						expect(board).toHaveProperty('user_id', expect.any(Number));
						expect(board).toHaveProperty('first_name', expect.any(String));
						expect(board).toHaveProperty('last_name', expect.any(String));
						expect(board).toHaveProperty('email', expect.any(String));
						expect(board).toHaveProperty('password', expect.any(String));
					});
				});
		});
	});
});

describe('/api/tasks', () => {
	describe('GET', () => {
		test('200: responds with an array of tasks objects', () => {
			return request(app)
				.get('/api/tasks')
				.expect(200)
				.then((response) => {
					const allTasks = response.body.tasks;
					expect(typeof response.body).toBe('object');
					expect(Array.isArray(allTasks)).toBe(true);
					expect(allTasks.length > 0).toBe(true);
					allTasks.forEach((task) => {
						expect(task).toHaveProperty('task_id', expect.any(Number));
						expect(task).toHaveProperty('column_id', expect.any(Number));
						expect(task).toHaveProperty('title', expect.any(String));
						expect(task).toHaveProperty('description', expect.any(String));
						expect(task).toHaveProperty('status', expect.any(String));
						expect(task).toHaveProperty('created_at', expect.any(String));
					});
				});
		});
	});
	describe('POST', () => {
		test('201: responds with a task newly added to the database', () => {
			const newTask = {
				column_id: 1,
				title: 'New Task',
				description: 'Just a new task',
				status: 'Todo',
				subtasks: [
					{ subtask_title: '', is_completed: false },
					{ subtask_title: '', is_completed: false },
				],
			};
			return request(app)
				.post('/api/tasks')
				.send(newTask)
				.expect(201)
				.then((response) => {
					expect(response.body.task).toEqual({
						column_id: 1,
						task_id: 23,
						title: 'New Task',
						description: 'Just a new task',
						status: 'Todo',
						created_at: expect.any(String),
					});
				});
		});
	});
});

describe('/api/tasks/:task_id', () => {
	describe('DELETE', () => {
		test('204: responds with an empty response body', () => {
			return request(app).delete('/api/tasks/3').expect(204);
		});
	});
});

describe('/api/tasks/:task_id/subtasks', () => {
	describe('GET', () => {
		test('200: responds with an array of subtasks for the given task id', () => {
			return request(app)
				.get('/api/tasks/3/subtasks')
				.expect(200)
				.then((response) => {
					const allSubtasks = response.body.subtasks;
					expect(Array.isArray(allSubtasks)).toBe(true);
					expect(allSubtasks.length > 0).toBe(true);
					allSubtasks.forEach((subtask) => {
						expect(subtask).toHaveProperty('task_id', expect.any(Number));
						expect(subtask).toHaveProperty('subtask_id', expect.any(Number));
						expect(subtask).toHaveProperty('title', expect.any(String));
						expect(subtask).toHaveProperty('is_completed', expect.any(Boolean));
					});
				});
		});
	});
});

describe('/api/subtasks', () => {
	describe('GET', () => {
		test('200: responds with an array of subtasks objects', () => {
			return request(app)
				.get('/api/subtasks')
				.expect(200)
				.then((response) => {
					const allSubtasks = response.body.subtasks;
					expect(typeof response.body).toBe('object');
					expect(Array.isArray(allSubtasks)).toBe(true);
					expect(allSubtasks.length > 0).toBe(true);
					allSubtasks.forEach((subtask) => {
						expect(subtask).toHaveProperty('subtask_id', expect.any(Number));
						expect(subtask).toHaveProperty('task_id', expect.any(Number));
						expect(subtask).toHaveProperty('title', expect.any(String));
						expect(subtask).toHaveProperty('is_completed', expect.any(Boolean));
						expect(subtask).toHaveProperty('created_at', expect.any(String));
					});
				});
		});
	});
});
