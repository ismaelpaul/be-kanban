const tasksHandlers = require('./tasks');
const subtasksHandlers = require('./subtasks');
const boardsHandlers = require('./boards');
const teamsHandlers = require('./teams');
const columnsHandlers = require('./columns');

module.exports = {
	...tasksHandlers,
	...subtasksHandlers,
	...boardsHandlers,
	...teamsHandlers,
	...columnsHandlers,
};
