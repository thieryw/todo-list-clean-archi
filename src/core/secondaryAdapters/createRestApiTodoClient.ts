import type { TodoListClient, Task } from "../ports/TodoListClient";
import { assert } from "tsafe/assert";
import { flip } from "tsafe/flip";
import { createTaskFlipBooleanValue } from "../ports/TodoListClient";

const url = "http://williamthiery007.ddns.net";



export async function createRestApiTodoClient(): Promise<TodoListClient> {



	const todoClient: TodoListClient = {
		"getTasks": async () => {

			return await fetch(url, {
				"method": "GET"
			}).then(res => res.json());

		},
		"createTask": async ({ message }) => {


			const post: Omit<Task, "id"> = {
				message,
				"isCompleted": false,
				"isSelected": false
			};

			await fetch(url, {
				"method": "POST",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(post)
			});

			const tasks = await todoClient.getTasks();

			return tasks[tasks.length - 1];

		},
		"deleteTask": async ({ id }) => {
			await fetch(url, {
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(id)
			});

			return Promise.resolve();
		},
		"toggleTaskCompleted": async ({ id }) => {

			await taskFlipBooleanValue({
				"tasks": [
					(await todoClient.getTasks())
						.find(task => task.id === id) as Task
				],
				"valueToFlip": "isCompleted"
			});

		},
		"toggleTaskSelected": async ({ id }) => {
			await taskFlipBooleanValue({
				"tasks": [
					(await todoClient.getTasks())
						.find(task => task.id === id) as Task
				],
				"valueToFlip": "isSelected"
			});
		},
		"completeSelectedTasks": async () => {

			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(task => task.isSelected && !task.isCompleted),
				"valueToFlip": "isCompleted"
			})
		},
		"unCompleteSelectedTasks": async () => {

			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(task => task.isSelected && task.isCompleted),
				"valueToFlip": "isCompleted"
			})
		},
		"deleteSelectedTasks": async () => {

			const deletedTaskIds = (await todoClient.getTasks())
				.filter(({ isSelected }) => isSelected)
				.map(({ id }) => id);

			await fetch(url, {
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(deletedTaskIds)
			});

			return {
				deletedTaskIds
			};
		},
		"selectAll": async () => {

			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(({isSelected}) => !isSelected),
				"valueToFlip": "isSelected"
			});
		},
		"unSelectAll": async () => {

			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(({isSelected}) => isSelected),
				"valueToFlip": "isSelected"
			})
		},
		"deleteAll": async () => {
			await fetch(url, {
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				}
			})
		},
		"completeAll": async () => {
			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(({isCompleted}) => !isCompleted),
				"valueToFlip": "isCompleted"
			});
		},
		"unCompleteAll": async () => {
			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(({isCompleted}) => isCompleted),
				"valueToFlip": "isCompleted"
			});
		}
	};


	const { taskFlipBooleanValue } = createTaskFlipBooleanValue({
		"action": async ({ tasks, valueToFlip }) => {

			if (tasks.length === 1) {
				assert(tasks[0] !== undefined);
			}

			tasks.forEach(task => {
				flip(task, valueToFlip);
			});


			await fetch(url, {
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