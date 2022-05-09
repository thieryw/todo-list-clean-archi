import type { TodoListClient, Task } from "../ports/TodoListClient";
import { assert } from "tsafe/assert";
import { flip } from "tsafe/flip";
import { createTaskFlipBooleanValue } from "../ports/TodoListClient";

const url = "http://williamthiery99.ddns.net";

export function createRestApiTodoClient(): TodoListClient {

	const todoClient: TodoListClient = {
		"getTasks": async () => {

			return await fetch(`${url}`, {
				"method": "GET",
			}).then(res => res.json());

		},
		"createTask": async ({ message }) => {

			const out: Omit<Task, "id"> = {
				message,
				"isCompleted": false,
				"isSelected": false
			};

			await fetch(url, {
				"method": "POST",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(out)
			});

			return (await todoClient.getTasks())[0];

		},
		"deleteTask": ({ id }) => {
			fetch(url, { 
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(id)
			});

			return Promise.resolve();
		},
		"toggleTaskCompleted": async ({ id }) => {


			taskFlipBooleanValue({
				"tasks": [
					(await todoClient.getTasks())
						.find(task => task.id === id) as Task
				],
				"valueToFlip": "isCompleted"
			});

		},
		"toggleTaskSelected": async ({ id }) => {
			taskFlipBooleanValue({
				"tasks": [
					(await todoClient.getTasks())
						.find(task => task.id === id) as Task
				],
				"valueToFlip": "isSelected"
			});
		},
		"completeSelectedTasks": async () => {
			const unCompleteSelectedTasks = (await todoClient.getTasks())
				.filter(task => task.isSelected && !task.isCompleted)

				taskFlipBooleanValue({
					"tasks": unCompleteSelectedTasks,
					"valueToFlip": "isCompleted"
				})
		},
		"unCompleteSelectedTasks": async () => {
			const completeSelectedTasks = (await todoClient.getTasks())
				.filter(task => task.isSelected && task.isCompleted);

				taskFlipBooleanValue({
					"tasks": completeSelectedTasks,
					"valueToFlip": "isCompleted"
				})
		},
		"deleteSelectedTasks": async () => {
			const tasks = await todoClient.getTasks();
			const deletedTaskIds = tasks
				.filter(task => task.isSelected).map(({ id }) => id);


			await fetch(url, {
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(deletedTaskIds)
			});

			return tasks.filter(task => !task.isSelected);

		},
		"selectAll": async () => {
			const unSelectedTasks = (await todoClient.getTasks())
				.filter(task => !task.isSelected)

			await taskFlipBooleanValue({
				"tasks": unSelectedTasks,
				"valueToFlip": "isSelected"
			});
		},
		"unSelectAll": async () => {
			const selectedTasks = (await todoClient.getTasks())
				.filter(task => task.isSelected)

			taskFlipBooleanValue({
				"tasks": selectedTasks,
				"valueToFlip": "isSelected"
			})
		}
	};

	const { taskFlipBooleanValue } = createTaskFlipBooleanValue({
		"action": ({ tasks, valueToFlip }) => {

			if (tasks.length === 1) {
				assert(tasks[0] !== undefined);
			}

			tasks.forEach(task => {
				flip(task, valueToFlip);
			});

			fetch(url, {
				"method": "PUT",
				"headers": {
					'Content-Type': 'application/json',
				},
				"body": JSON.stringify(tasks)
			});

			return Promise.resolve();

		}
	});

	return todoClient;
}