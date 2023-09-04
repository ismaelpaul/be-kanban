const formatData = (data) => {
	const formattedData = {
		boards: data.boards.map((board) => ({
			name: board.name,
			columns: board.columns.map((column) => ({
				name: column.name,
				tasks: column.tasks.map((task) => ({
					title: task.title,
					description: task.description,
					status: task.status,
					subtasks: task.subtasks.map((subtask) => ({
						title: subtask.title,
						isCompleted: subtask.isCompleted,
					})),
				})),
			})),
		})),
	};

	return formattedData;
};

module.exports = { formatData };
