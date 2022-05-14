import type { TodoListClient, Task } from "../ports/TodoListClient";
import { assert } from "tsafe/assert";
import { flip } from "tsafe/flip";
import { createTaskFlipBooleanValue } from "../ports/TodoListClient";
import * as runEx from "run-exclusive";

const url = "http://williamthiery007.ddns.net";


async function getTasks(): Promise<{tasks: Task[]}>{

	return {
		"tasks": await fetch(url, {
			"method": "GET"
		}).then(res => res.json())
	}

}

export async function createRestApiTodoClient(): Promise<TodoListClient> {

	let { tasks } = await getTasks();

	const groupTaskFunctions = runEx.createGroupRef();

	const todoClient: TodoListClient = {
		"getTasks": async () => {

			return (await getTasks()).tasks;

		},
		"createTask": runEx.build(groupTaskFunctions, async ({ message }) => {


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

			tasks.push({
				...out,
				"id": tasks.length === 0 ? 0 : Math.max(...tasks.map(task => task.id)) + 1
			});

			return tasks[tasks.length - 1];

		}),
		"deleteTask": runEx.build(groupTaskFunctions, async ({ id }) => {
			tasks.splice(tasks.findIndex(task => task.id === id), 1);
			await fetch(url, {
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(id)
			});

			return Promise.resolve();
		}),
		"toggleTaskCompleted": runEx.build(groupTaskFunctions, async ({ id }) => {

			await taskFlipBooleanValue({
				"tasks": [
					tasks
						.find(task => task.id === id) as Task
				],
				"valueToFlip": "isCompleted"
			});

		}),
		"toggleTaskSelected": runEx.build(groupTaskFunctions, async ({ id }) => {
			await taskFlipBooleanValue({
				"tasks": [
					tasks
						.find(task => task.id === id) as Task
				],
				"valueToFlip": "isSelected"
			});
		}),
		"completeSelectedTasks": runEx.build(groupTaskFunctions, async () => {

			await taskFlipBooleanValue({
				"tasks": tasks
					.filter(task => task.isSelected && !task.isCompleted),
				"valueToFlip": "isCompleted"
			})
		}),
		"unCompleteSelectedTasks": runEx.build(groupTaskFunctions, async () => {

			await taskFlipBooleanValue({
				"tasks": tasks
					.filter(task => task.isSelected && task.isCompleted),
				"valueToFlip": "isCompleted"
			})
		}),
		"deleteSelectedTasks": runEx.build(groupTaskFunctions, async () => {

			const deletedTaskIds = tasks
				.filter(({ isSelected }) => isSelected)
				.map(({ id }) => id);

			tasks = tasks.filter(({isSelected}) => !isSelected);

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
		}),
		"selectAll": runEx.build(groupTaskFunctions, async () => {

			await taskFlipBooleanValue({
				"tasks": tasks.filter(({isSelected}) => !isSelected),
				"valueToFlip": "isSelected"
			});
		}),
		"unSelectAll": runEx.build(async () => {

			await taskFlipBooleanValue({
				"tasks": tasks.filter(({isSelected}) => isSelected),
				"valueToFlip": "isSelected"
			})
		}),
		"deleteAll": runEx.build(groupTaskFunctions, async () => {
			tasks = [];
			await fetch(url, {
				"method": "DELETE",
				"headers": {
					"Content-Type": "application/json"
				}
			})
		}),
		"completeAll": runEx.build(groupTaskFunctions, async () => {
			await taskFlipBooleanValue({
				"tasks": tasks.filter(({isCompleted}) => !isCompleted),
				"valueToFlip": "isCompleted"
			});
		}),
		"unCompleteAll": runEx.build(groupTaskFunctions, async () => {
			await taskFlipBooleanValue({
				"tasks": tasks.filter(({isCompleted}) => isCompleted),
				"valueToFlip": "isCompleted"
			});
		})
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