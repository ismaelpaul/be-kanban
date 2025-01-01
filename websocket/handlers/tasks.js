const {
	insertSubtask,
	removeSubtask,
	updateSubtaskTitleById,
} = require('../../models/subtasks.models');
const {
	updateTaskCompletion,
	insertTask,
	removeTaskById,
	updateTaskByTaskId,
	updateTaskPositionAndStatusByTaskId,
} = require('../../models/tasks.models');

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
	ADD_NEW_TASK: async (payload) => {
		const column_id = payload.column_id;

		const { title, description, status } = payload.task;
		try {
			const newTask = await insertTask(column_id, title, description, status);
			const task_id = newTask.task_id;
			const subtasks = payload.task.subtasks;

			const nonEmptySubtasks = subtasks.filter(
				(subtask) => subtask.title.trim() !== ''
			);

			if (nonEmptySubtasks.length > 0) {
				const subtaskPromises = nonEmptySubtasks.map((subtask) => {
					const title = subtask.title;
					const is_completed = subtask.is_completed;
					return insertSubtask(task_id, title, is_completed);
				});

				await Promise.all(subtaskPromises);
			}

			return {
				type: 'TASK_ADDED',
				task: newTask,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
	DELETE_TASK: async (payload) => {
		const { task_id } = payload;

		try {
			const deletedTask = await removeTaskById(task_id);

			return {
				type: 'TASK_DELETED',
				task: deletedTask,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
	UPDATE_TASK_INFO: async (payload) => {
		const { task_id, column_id, title, description } = payload.task;

		const currentTaskPosition =
			payload.task.positionAndStatus.currentTaskPosition;
		const newTaskPosition = payload.task.positionAndStatus.newTaskPosition;
		const newColumn_id = payload.task.positionAndStatus.newColumnId;
		const newStatus = payload.task.positionAndStatus.newStatus;

		const subtasksToDelete = payload.subtasks.toDelete;
		const subtasksToAdd = payload.subtasks.toAdd;
		const subtasksToEdit = payload.subtasks.toEdit;

		try {
			// Update title and description
			if (title || description) {
				await updateTaskByTaskId(task_id, title, description);
			}

			// Update task position and status
			if (
				newColumn_id !== null ||
				newStatus !== null ||
				newTaskPosition !== null
			) {
				await updateTaskPositionAndStatusByTaskId(
					newTaskPosition,
					currentTaskPosition,
					newColumn_id,
					column_id,
					newStatus,
					task_id
				);
			}

			// Handle deleted subtasks
			if (subtasksToDelete.length > 0) {
				const deletionSubtasksPromise = subtasksToDelete.map((subtask_id) =>
					removeSubtask(subtask_id)
				);
				await Promise.all(deletionSubtasksPromise);
			}

			// Handle new subtasks
			if (subtasksToAdd.length > 0) {
				const subtaskPromises = subtasksToAdd.map((subtask) => {
					const title = subtask.title;
					const is_completed = subtask.is_completed;
					return insertSubtask(task_id, title, is_completed);
				});
				await Promise.all(subtaskPromises);
			}

			// Handle edited subtasks
			if (subtasksToEdit.length > 0) {
				const subtaskPromises = subtasksToEdit.map((subtask) => {
					const { title } = subtask;
					const subtask_id = subtask.id;

					return updateSubtaskTitleById(title, subtask_id);
				});
				await Promise.all(subtaskPromises);
			}

			return {
				type: 'TASK_INFO_UPDATED',
				newColumn_id: newColumn_id,
				column_id: column_id,
			};
		} catch (error) {
			return {
				type: 'ERROR',
				message: error.message || 'An unexpected error occurred',
			};
		}
	},
};
