import type { TodoClient, Todo } from "../ports/TodoClient";
import { assert } from "tsafe/assert";
import { flip } from "tsafe/flip";
import { createTaskFlipBooleanValue } from "../ports/TodoClient";

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
				"id": todos.length === 0 ? 0 : Math.max(...todos.map(({ id }) => id)),
				message,
				"isCompleted": false,
				"isSelected": false
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
		}
	};

	const { taskFlipBooleanValue } = createTaskFlipBooleanValue({
		"action": async ({ id, valueToFlip }) => {
			const todos = await todoClient.getTodos();
			const todo = todos.find(todo => todo.id === id);
			assert(todo !== undefined);
			flip(todo, valueToFlip);
			localStorage.setItem(localStorageKey, JSON.stringify(todos));
		}
	})

	return todoClient;

}