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
	});
});
