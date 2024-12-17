const WebSocket = require('ws');
const handlers = require('./websocket/handlers/index');

module.exports = (server) => {
	// Create WebSocket server on '/ws' path
	const wss = new WebSocket.Server({ noServer: true });

	server.on('upgrade', (request, socket, head) => {
		if (request.url === '/ws') {
			wss.handleUpgrade(request, socket, head, (ws) => {
				wss.emit('connection', ws, request);
			});
		} else {
			socket.destroy();
		}
	});

	// Handle WebSocket connections
	wss.on('connection', (ws) => {
		console.log('New WebSocket connection established.');

		ws.on('message', async (message) => {
			try {
				// Parse the incoming JSON message
				const data = JSON.parse(message);

				// Route to the correct handler based on the 'type'
				const handler = handlers[data.type];

				if (handler) {
					const response = await handler(data.payload);
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

		// Handle WebSocket disconnection
		ws.on('close', () => {
			console.log('WebSocket connection closed.');
		});

		ws.on('error', (error) => {
			console.error('WebSocket error:', error);
		});
	});

	console.log('WebSocket server initialized.');
};
