const WebSocket = require('ws');
const handlers = require('./websocket/handlers/index');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { checkUserExistsById } = require('./models/auth.models');
const { getTeamIdByUserId } = require('./models/teams.models');

module.exports = (server) => {
	const wss = new WebSocket.Server({ noServer: true });

	const teamConnections = new Map();

	const authenticateWebSocket = async (request) => {
		try {
			const cookies = cookie.parse(request.headers.cookie || '');
			const token = cookies.token;

			if (!token) {
				throw new Error('No token provided');
			}

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			const user_id = decoded.user_id;

			if (!user_id) {
				throw new Error('Invalid token');
			}

			const existingUser = await checkUserExistsById(user_id);

			if (!existingUser.userExists) {
				throw new Error('User not found');
			}

			return existingUser.user;
		} catch (error) {
			console.error('WebSocket Authentication Error:', error.message);
			throw error;
		}
	};

	server.on('upgrade', async (request, socket, head) => {
		if (request.url === '/ws') {
			try {
				const user = await authenticateWebSocket(request);

				wss.handleUpgrade(request, socket, head, (ws) => {
					ws.user = user;
					wss.emit('connection', ws, request);
				});
			} catch (error) {
				socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
				socket.destroy();
			}
		} else {
			socket.destroy();
		}
	});

	wss.on('connection', async (ws) => {
		const user_id = ws.user.user_id;

		try {
			const result = await getTeamIdByUserId(user_id);

			if (result.rows.length > 0) {
				const team_id = result.rows[0].team_id;

				ws.user.team_id = team_id;

				if (!teamConnections.has(team_id)) {
					teamConnections.set(team_id, new Set());
				}
				teamConnections.get(team_id).add(ws);

				ws.on('close', () => {
					teamConnections.get(team_id).delete(ws);
					if (teamConnections.get(team_id).size === 0) {
						teamConnections.delete(team_id);
					}
				});
			}
		} catch (err) {
			console.error('Database error:', err);
		}

		ws.on('message', async (message) => {
			const user_id = ws.user.user_id;

			try {
				const data = JSON.parse(message);

				const handler = handlers[data.type];

				if (handler) {
					const response = await handler(data.payload, ws, teamConnections);
					const team_id = ws.user.team_id;

					broadcastToTeam(team_id, response);
					ws.send(JSON.stringify(response));
				} else {
					ws.send(
						JSON.stringify({ type: 'ERROR', message: 'Unknown action type' })
					);
				}
			} catch (err) {
				console.error('WebSocket Error:', err);
				ws.send(
					JSON.stringify({ type: 'ERROR', message: 'Invalid message format' })
				);
			}
		});

		ws.on('close', () => {
			console.log(
				`WebSocket connection closed for user ${ws.user.first_name}.`
			);
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
		});
	});

	const broadcastToTeam = (team_id, message) => {
		if (teamConnections.has(team_id)) {
			const teamMembers = teamConnections.get(team_id);
			teamMembers.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(message));
				}
			});
		} else {
			console.log(`No users connected to team ${team_id}`);
		}
	};
};
