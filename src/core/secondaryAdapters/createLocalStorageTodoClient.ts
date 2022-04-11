import type { TodoClient, Todo } from "../ports/TodoClient";
import { assert } from "tsafe/assert";
import { createRandomId } from "core/tools/createRandomId";
import { flip } from "tsafe/flip";

const localStorageKey = "todos";

export function createLocalStorageTodoClient(): TodoClient {

	const todoClient: TodoClient = {
		"getTodos": () => {

			const todosJson = localStorage.getItem(localStorageKey);
			return Promise.resolve(todosJson === null ? [] : JSON.parse(todosJson));

		},
		"createTodo": async ({ message }) => {

			const todos = await todoClient.getTodos();

			const todo: Todo = {
				"id": createRandomId(),
				message,
				"isCompleted": false,
			};

			todos.push(todo);

			localStorage.setItem(localStorageKey, JSON.stringify(todos));

			return todo;

		},
		"deleteTodo": async ({ id }) => {

			const todos = await todoClient.getTodos();
			const todosWithoutDeletedTodo = todos.filter(todo => todo.id !== id);
			localStorage.setItem(localStorageKey, JSON.stringify(todosWithoutDeletedTodo));

		},
		"toggleTodoCompleted": async ({ id }) => {

			const todos = await todoClient.getTodos();
			const todo = todos.find(todo => todo.id === id);
			assert(todo !== undefined);
			flip(todo, "isCompleted");
			localStorage.setItem(localStorageKey, JSON.stringify(todos));


		}
	};

	return todoClient;

}