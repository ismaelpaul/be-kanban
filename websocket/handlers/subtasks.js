const { updateSubtaskCompletionById } = require('../../models/subtasks.models');
module.exports = {
	UPDATE_SUBTASK_COMPLETION: async (payload) => {
		const { subtask_id, is_completed } = payload;

		try {
			const updatedSubtask = await updateSubtaskCompletionById(
				is_completed,
				subtask_id
			);

			return {
				type: 'SUBTASK_COMPLETION_UPDATED',
				subtask: updatedSubtask,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
};
