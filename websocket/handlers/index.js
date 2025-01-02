const tasksHandlers = require('./tasks');
const subtasksHandlers = require('./subtasks');
const boardsHandlers = require('./boards');

module.exports = {
	...tasksHandlers,
	...subtasksHandlers,
	...boardsHandlers,
};
