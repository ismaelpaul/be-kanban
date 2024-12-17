const { updateTaskCompletion } = require('../../models/tasks.models');

module.exports = {
	UPDATE_TASK_COMPLETION: async (payload) => {
		const { task_id, is_completed } = payload;

		try {
			const updatedTask = await updateTaskCompletion(is_completed, task_id);

			return {
				type: 'TASK_COMPLETION_UPDATED',
				task: updatedTask,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
};
