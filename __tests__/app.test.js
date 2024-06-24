const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const devData = require('../db/data/test-data/data.json');
const jwt = require('jsonwebtoken');
require('dotenv').config();
beforeEach(() => seed({ data: devData }));

afterAll(() => db.end());

describe('/api/boards', () => {
	describe('GET', () => {
		test('200: responds with an array of boards objects', () => {
			const token = jwt.sign({ user_id: 1 }, process.env.JWT_SECRET, {
				expiresIn: '1h',
			});

			return request(app)
				.get('/api/boards')
				.set('Cookie', `token=${token}`)
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
				name: 'Production',
				columns: [{ name: 'To Do' }, { name: 'Doing' }],
			};

			const token = jwt.sign({ user_id: 1 }, process.env.JWT_SECRET, {
				expiresIn: '1h',
			});

			return request(app)
				.post('/api/boards')
				.set('Cookie', `token=${token}`)
				.send(newBoard)
				.expect(201)
				.then((response) => {
					expect(response.body.board).toEqual({
						board_id: 4,
						user_id: 1,
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

describe('/api/user', () => {
	describe('GET', () => {
		test('200: responds with the logged in user object', () => {
			const token = jwt.sign({ user_id: 1 }, process.env.JWT_SECRET, {
				expiresIn: '1h',
			});
			return request(app)
				.get('/api/user')
				.set('Cookie', `token=${token}`)
				.expect(200)
				.then((response) => {
					const user = response.body.user;
					expect(typeof response.body).toBe('object');

					expect(user).toHaveProperty('user_id', expect.any(Number));
					expect(user).toHaveProperty('first_name', expect.any(String));
					expect(user).toHaveProperty('last_name', expect.any(String));
					expect(user).toHaveProperty('email', expect.any(String));
					expect(user).toHaveProperty('avatar', expect.any(String));
				});
		});
	});
	describe('/api/user/register', () => {
		describe('POST', () => {
			test('201: responds with the newly registered user data', () => {
				const newUser = {
					firstName: 'John',
					lastName: 'Doe',
					email: 'john.doe@example.com',
					password: 'password123',
				};
				return request(app)
					.post('/api/user/register')
					.send(newUser)
					.expect(201)
					.then((response) => {
						const user = response.body;
						const cookies = response.headers['set-cookie'];
						let token;
						if (cookies && cookies.length > 0) {
							// Find the cookie that starts with 'token='
							const tokenCookie = cookies.find((cookie) =>
								cookie.startsWith('token=')
							);

							// Extract the token value between 'token=' and the next ';' or end of the string
							token = tokenCookie.split('token=')[1].split(';')[0];
						}

						expect(typeof user).toBe('object');
						expect(typeof token).toBe('string');

						expect(user).toHaveProperty('user_id', expect.any(Number));
						expect(user).toHaveProperty('first_name', 'John');
						expect(user).toHaveProperty('last_name', 'Doe');
						expect(user).toHaveProperty('email', 'john.doe@example.com');

						const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
						expect(decodedToken).toHaveProperty('user_id', user.user_id);
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
				position: null,
				status: 'Todo',
				subtasks: [
					{ title: 'Subtask', is_completed: false },
					{ title: 'Subtask 2', is_completed: false },
				],
			};
			return request(app)
				.post('/api/tasks')
				.send(newTask)
				.expect(201)
				.then((response) => {
					const task = response.body.task;

					expect(task).toHaveProperty('task_id', expect.any(Number));
					expect(task).toHaveProperty('column_id', expect.any(Number));
					expect(task).toHaveProperty('title', expect.any(String));
					expect(task).toHaveProperty('description', expect.any(String));
					expect(task).toHaveProperty('position', null);
					expect(task).toHaveProperty('status', expect.any(String));
					expect(task).toHaveProperty('created_at', expect.any(String));
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
describe('/api/subtasks/:subtask_id', () => {
	describe('PATCH', () => {
		test('200: responds with the recently modified subtask object', () => {
			return request(app)
				.get(`/api/subtasks/3`)
				.then((response) => {
					if (response.status !== 200) {
						throw new Error('Failed to retrieve the current value');
					}

					const currentCompletion = response.body.subtask.is_completed;

					const newCompletion = !currentCompletion;

					return request(app)
						.patch(`/api/subtasks/3`)
						.send({ is_completed: newCompletion })
						.then((patchResponse) => {
							expect(patchResponse.body.subtask).toEqual({
								subtask_id: 3,
								task_id: expect.any(Number),
								title: expect.any(String),
								is_completed: expect.any(Boolean),
								created_at: expect.any(String),
							});
							expect(patchResponse.status).toBe(200);
						});
				});
		});
	});
});
