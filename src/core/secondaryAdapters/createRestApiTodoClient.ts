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
			fetch(`${url}/${id}`, { 
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				}
			});

			return Promise.resolve();
		},
		"toggleTaskCompleted": ({ id }) => {
			taskFlipBooleanValue({
				id,
				"valueToFlip": "isCompleted"
			});

			return Promise.resolve();
		},
		"toggleTaskSelected": ({ id }) => {
			taskFlipBooleanValue({
				id,
				"valueToFlip": "isSelected"
			});

			return Promise.resolve();
		},
		"completeSelectedTasks": async () => {

		},
		"unCompleteSelectedTasks": async () => {

		},
		"deleteSelectedTasks": async () => {
			return null as any;
			
		},
		"selectAll": async () => {
		},
		"unSelectAll": async () => {

		}
	};

	const { taskFlipBooleanValue } = createTaskFlipBooleanValue({
		"action": async ({ id, valueToFlip }) => {
			const task = (
				(await todoClient.getTasks()) as Task[]
			).find(todo => todo.id === id);
			assert(task !== undefined);
			flip(task, valueToFlip);
			await fetch(url, {
				"method": "PUT",
				"headers": {
					'Content-Type': 'application/json',
				},
				"body": JSON.stringify(task)
			})
		}
	});

	return todoClient;
}