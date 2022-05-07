import type { TodoClient, Todo } from "../ports/TodoClient";
import { assert } from "tsafe/assert";
import { flip } from "tsafe/flip";
import { createTaskFlipBooleanValue } from "../ports/TodoClient";

const url = "http://williamthiery99.ddns.net";

export function createRestApiTodoClient(): TodoClient {

	const todoClient: TodoClient = {
		"getTodos": async () => {

			return await fetch(`${url}`, {
				"method": "GET",
			}).then(res => res.json());

		},
		"createTodo": async ({ message }) => {

			const out: Omit<Todo, "id"> = {
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

			return (await todoClient.getTodos())[0];

		},
		"deleteTodo": async ({ id }) => {
			fetch(`${url}/${id}`, {
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				}
			})
		},
		"toggleTodoCompleted": async ({ id }) => {
			taskFlipBooleanValue({
				id,
				"valueToFlip": "isCompleted"
			});
		},
		"toggleTodoSelected": async ({ id }) => {
			taskFlipBooleanValue({
				id,
				"valueToFlip": "isSelected"
			});
		},
	};

	const { taskFlipBooleanValue } = createTaskFlipBooleanValue({
		"action": async ({ id, valueToFlip }) => {
			const task = (
				(await todoClient.getTodos()) as Todo[]
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