const tasksHandlers = require('./tasks');
const subtasksHandlers = require('./subtasks');

module.exports = {
	...tasksHandlers,
	...subtasksHandlers,
};
