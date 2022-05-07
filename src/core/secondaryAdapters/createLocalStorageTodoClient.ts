import type { TodoListClient, Task } from "../ports/TodoListClient";
import { assert } from "tsafe/assert";
import { flip } from "tsafe/flip";
import { createTaskFlipBooleanValue } from "../ports/TodoListClient";

const localStorageKey = "todos";

export function createLocalStorageTodoClient(): TodoListClient {

	const todoClient: TodoListClient = {
		"getTasks": () => {

			const todosJson = localStorage.getItem(localStorageKey);
			return Promise.resolve(todosJson === null ? [] : JSON.parse(todosJson));

		},
		"createTask": async ({ message }) => {

			const todos = await todoClient.getTasks();

			const todo: Task = {
				"id": todos.length === 0 ? 0 : Math.max(...todos.map(({ id }) => id)) + 1,
				message,
				"isCompleted": false,
				"isSelected": false
			};

			todos.push(todo);

			localStorage.setItem(localStorageKey, JSON.stringify(todos));

			return todo;

		},
		"deleteTask": async ({ id }) => {

			const todos = await todoClient.getTasks();
			const todosWithoutDeletedTodo = todos.filter(todo => todo.id !== id);
			localStorage.setItem(localStorageKey, JSON.stringify(todosWithoutDeletedTodo));

		},
		"toggleTaskCompleted":({ id }) => {
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
		"completeSelectedTasks": () => {
			setTasksCompleteness({
				"areCompleted": true
			});

			return Promise.resolve();
		},
		"deleteSelectedTasks": async () => {
			console.log(await todoClient.getTasks());
			const tasks = (await todoClient.getTasks()).filter(task => !task.isSelected);
			console.log(tasks);
			localStorage.setItem(localStorageKey, JSON.stringify(tasks))
			return tasks;
		},
		"unCompleteSelectedTasks": () => {
			setTasksCompleteness({
				"areCompleted": false
			});

			return Promise.resolve();
		},
		"selectAll": () => {
			setTasksSelected({
				"areSelected": true
			});

			return Promise.resolve();
		},
		"unSelectAll": () => {
			setTasksSelected({
				"areSelected": false
			});

			return Promise.resolve();
		}
	};

	async function setTasksSelected(params: {
		areSelected: boolean;
	}) {
		const { areSelected } = params;
		const tasks = await todoClient.getTasks();
		tasks.forEach(task => {
			if (task.isSelected === areSelected) {
				return;
			}
			task.isSelected = areSelected;
		})
		localStorage.setItem(localStorageKey, JSON.stringify(tasks));
	};

	async function setTasksCompleteness(params: {
		areCompleted: boolean;
	}) {

		const { areCompleted } = params;
		const tasks = await todoClient.getTasks();
		tasks.filter(task => task.isSelected).forEach(task => {
			if (task.isCompleted === areCompleted) {
				return;
			}
			task.isCompleted = areCompleted
		});
		localStorage.setItem(localStorageKey, JSON.stringify(tasks));
	}

	const { taskFlipBooleanValue } = createTaskFlipBooleanValue({
		"action": async ({ id, valueToFlip }) => {
			const todos = await todoClient.getTasks();
			const todo = todos.find(todo => todo.id === id);
			assert(todo !== undefined);
			flip(todo, valueToFlip);
			localStorage.setItem(localStorageKey, JSON.stringify(todos));
		}
	})

	return todoClient;

}