const http = require('http');
const app = require('./app');
const setupWebSocketServer = require('./websocket');
const PORT = process.env.PORT || 9090;

// Create an HTTP server and attach Express
const server = http.createServer(app);

// Pass the HTTP server to the WebSocket setup
setupWebSocketServer(server);

// Start the server
server.listen(PORT, () => {
	console.log(`HTTP server running on http://localhost:${PORT}`);
	console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});
