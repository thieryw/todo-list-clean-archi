import type { TodoClient, Todo } from "../ports/TodoClient";
import { createRandomId } from "../tools/createRandomId";
import { assert } from "tsafe/assert";
import { flip } from "tsafe/flip";

const url = "http://williamthiery99.ddns.net";

export function createRestApiTodoClient(): TodoClient {

	const todoClient: TodoClient = {
		"getTodos": async () => {

			return await fetch(url, {
				"method": "GET",
			}).then(res => res.json());


		},
		"createTodo": async ({ message }) => {

			const out: Todo = {
				message,
				"id": createRandomId(),
				"isCompleted": false
			};

			await fetch(url, {
				"method": "POST",
				"body": JSON.stringify(out)
			});

			return out;

		},
		"deleteTodo": async ({ id }) => {
			console.log(`${url}/${id}`)
			fetch(`${url}/${id}`, {
				"method": "DELETE",
			})
		},
		"toggleTodoCompleted": async ({ id }) => {
			todoClient.getTodos().then(todos => {
				const todo = todos.find(todo => todo.id = id);
				assert(todo !== undefined);
				flip(todo, "isCompleted");

				fetch(`${url}/${id}`, {
					"method": "PUT",
					"body": JSON.stringify(todo),
				}).then(() => console.log("ok"))
			});
		}
	}


	return todoClient;
}