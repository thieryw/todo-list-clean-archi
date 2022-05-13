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

			const tasks = await todoClient.getTasks();

			const task: Task = {
				"id": tasks.length === 0 ? 0 : Math.max(...tasks.map(({ id }) => id)) + 1,
				message,
				"isCompleted": false,
				"isSelected": false
			};

			tasks.push(task);

			localStorage.setItem(localStorageKey, JSON.stringify(tasks));

			return task;

		},
		"deleteTask": async ({ id }) => {

			const todos = await todoClient.getTasks();
			const todosWithoutDeletedTodo = todos.filter(todo => todo.id !== id);
			localStorage.setItem(localStorageKey, JSON.stringify(todosWithoutDeletedTodo));

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
			taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(({isCompleted, isSelected}) => isSelected && !isCompleted)
				,
				"valueToFlip": "isCompleted"
			})
		},
		"deleteSelectedTasks": async () => {
			const tasks = await todoClient.getTasks();
			localStorage.setItem(
				localStorageKey, 
				JSON.stringify(tasks.filter(task => !task.isSelected))
			);

			return {
				"deletedTaskIds": tasks.filter(({isSelected}) => isSelected).map(({id})=> id)
			}
		},
		"unCompleteSelectedTasks": async () => {
			taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(({isCompleted, isSelected}) => isCompleted && isSelected)
				,
				"valueToFlip": "isCompleted"
			})
		},
		"selectAll": async () => {
			taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(task => !task.isSelected)
				,
				"valueToFlip": "isSelected"
			})
		},
		"unSelectAll": async () => {
			taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(task => task.isSelected)
				,
				"valueToFlip": "isSelected"
			})
		},
		"deleteAll": () => {
			localStorage.setItem(localStorageKey, JSON.stringify([]));
			return Promise.resolve();
		},
		"completeAll": async () => {
			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(task => !task.isCompleted),
				"valueToFlip": "isCompleted"
			});
		},
		"unCompleteAll": async () => {
			await taskFlipBooleanValue({
				"tasks": (await todoClient.getTasks())
					.filter(task => task.isCompleted),
				"valueToFlip": "isCompleted"
			})
		}
	};

	const { taskFlipBooleanValue } = createTaskFlipBooleanValue({
		"action": ({ tasks, valueToFlip }) => {
			if (tasks.length === 1) {
				assert(tasks[0] !== undefined)
			}
			tasks.forEach(task => {
				flip(task, valueToFlip);
			});

			localStorage.setItem(localStorageKey, JSON.stringify(tasks));
			return Promise.resolve();
		}
	})

	return todoClient;

}