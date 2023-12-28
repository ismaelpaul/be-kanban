const { insertSubtask } = require('../models/subtasks.models');
const {
	selectTasks,
	selectSubtasksByTaskId,
	removeTaskById,
	insertTask,
	updateTaskPositionByTaskId,
} = require('../models/tasks.models');

exports.getTasks = (req, res, next) => {
	selectTasks()
		.then((tasks) => res.status(200).send({ tasks }))
		.catch(next);
};

exports.deleteTaskById = (req, res, next) => {
	const { task_id } = req.params;

	removeTaskById(task_id)
		.then((task) => {
			res.status(204).send({ task });
		})
		.catch(next);
};

exports.getSubtasksByTaskId = (req, res, next) => {
	const { task_id } = req.params;

	selectSubtasksByTaskId(task_id)
		.then((subtasks) => {
			res.status(200).send({ subtasks });
		})
		.catch(next);
};

exports.addNewTaskAndSubtasks = (req, res, next) => {
	const newTask = req.body;
	const { column_id, title, description, status } = newTask;
	insertTask(column_id, title, description, status).then((task) => {
		const task_id = task.task_id;
		const subtasks = newTask.subtasks;

		const nonEmptySubtasks = subtasks.filter(
			(subtask) => subtask.title.trim() !== ''
		);
		if (nonEmptySubtasks.length > 0) {
			const subtaskPromises = nonEmptySubtasks.map((subtask) => {
				const title = subtask.title;
				const is_completed = subtask.is_completed;
				return insertSubtask(task_id, title, is_completed);
			});

			Promise.all(subtaskPromises)
				.then(() => res.status(201).send({ task }))
				.catch(next);
		} else {
			res.status(201).send({ task });
		}
	});
};

exports.patchTaskPositionByTaskId = (req, res, next) => {
	const { newTaskPosition, currentTaskPosition, newColumnId, currentColumnId } =
		req.body;
	const { task_id } = req.params;

	const newColumn_id = newColumnId;

	updateTaskPositionByTaskId(
		newTaskPosition,
		currentTaskPosition,
		newColumn_id,
		currentColumnId,
		task_id
	)
		.then((tasks) => {
			res.status(200).send({ tasks });
		})
		.catch(next);
};

exports.addNewSubtaskByTaskId = (req, res, next) => {
	const { task_id } = req.params;
	const newSubtask = req.body;

	const subtaskPromises = newSubtask.map((subtask) => {
		const title = subtask.title;
		const is_completed = subtask.is_completed;
		return insertSubtask(task_id, title, is_completed);
	});
	Promise.all(subtaskPromises)
		.then((subtasks) => res.status(201).send({ subtasks }))
		.catch(next);
};
