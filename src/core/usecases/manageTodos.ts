import type { ThunkAction } from "../setup";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { State } from "../setup";
import { createSelector } from "@reduxjs/toolkit";
import type { Task } from "../ports/TodoListClient";
//import { createObjectThatThrowsIfAccessed } from "core/tools/createObjectThatThrowsIfAccessed";
import { flip } from "tsafe/flip";
import { id } from "tsafe/id";

export type ManageTodosState = {
	tasks: Task[];
};

export const { reducer, actions, name } = createSlice({
	"name": "manageTasks",
	"initialState": id<ManageTodosState>({ "tasks": [] }),
	"reducers": {
		"initialized": (_state, { payload }: PayloadAction<{ tasks: Task[]; }>) => {
			const { tasks } = payload;
			return { tasks };
		},
		"taskDeleted": (state, { payload }: PayloadAction<{ id: number; }>) => {
			const { id: taskId } = payload;

			state.tasks = state.tasks.filter(task => task.id !== taskId);

		},
		"taskCreated": (state, { payload }: PayloadAction<{ task: Task }>) => {
			const { task } = payload;
			state.tasks.push({
				...task
			})
		},
		"taskCompletedToggled": (state, { payload }: PayloadAction<{ id: number }>) => {
			const { id: taskId } = payload;

			const index = state.tasks.findIndex(({ id }) => taskId === id);

			flip(state.tasks[index], "isCompleted")

		},
		"taskSelectedToggled": (state, { payload }: PayloadAction<{ id: number }>) => {
			const { id: taskId } = payload;
			flip(
				state.tasks[state.tasks.findIndex(({ id }) => taskId === id)],
				"isSelected"
			)
		},
		"tasksCompleted": ({ tasks }) => {
			tasks.filter(task => task.isSelected).forEach(task => {
				task.isCompleted = true;
			});
		},
		"tasksUnCompleted": ({ tasks }) => {
			tasks.filter(task => task.isSelected).forEach(task => {
				task.isCompleted = false;
			});
		},
		"tasksSelected": ({ tasks }) => {
			tasks.filter(task => !task.isSelected).forEach(task => {
				task.isSelected = true;
			})
		},
		"tasksUnSelected": ({ tasks }) => {
			tasks.filter(task => task.isSelected).forEach(task => {
				task.isSelected = false;
			})
		},
		"tasksDeleted": ({ tasks }, { payload }: PayloadAction<{ deletedTaskIds: number[] }>) => {
			const { deletedTaskIds } = payload;
			deletedTaskIds.forEach(id => {
				tasks.splice(
					tasks.findIndex(task => task.id === id)
					, 1
				);
			});
		}

	},
});

export const privateThunks = {
	"initialize":
		(): ThunkAction =>
			async (...args) => {

				const [dispatch, , { todoClient }] = args;

				const tasks = await todoClient.getTasks();

				dispatch(actions.initialized({ tasks }));

			}
};

export const thunks = {
	"deleteTask":
		(params: { id: number; }): ThunkAction =>
			async (...args) => {

				const { id } = params;

				const [dispatch, , { todoClient }] = args;
				await todoClient.deleteTask({ id });
				dispatch(actions.taskDeleted({ id }));

			},
	"createTask":
		(params: { message: string; }): ThunkAction =>
			async (...args) => {
				const { message } = params;
				const [dispatch, , { todoClient }] = args;
				const task: Task = await todoClient.createTask({
					message
				});

				dispatch(actions.taskCreated({ task }));

			},
	"toggleTaskCompleted":
		(params: { id: number; }): ThunkAction =>
			async (...args) => {

				const { id } = params;
				const [dispatch, , { todoClient }] = args;

				await todoClient.toggleTaskCompleted({ id });

				dispatch(actions.taskCompletedToggled({ id }))
			},
	"toggleTaskSelected": (params: { id: number }): ThunkAction =>
		async (...args) => {
			const { id } = params;
			const [dispatch, , { todoClient }] = args;

			await todoClient.toggleTaskSelected({ id });
			dispatch(actions.taskSelectedToggled({ id }));

		},
	"deleteSelectedTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			const { deletedTaskIds } = await todoClient.deleteSelectedTasks();
			dispatch(actions.tasksDeleted({
				deletedTaskIds
			}));
		},
	"completeSelectedTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.completeSelectedTasks();
			dispatch(actions.tasksCompleted());
		},
	"unCompleteSelectedTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.unCompleteSelectedTasks();
			dispatch(actions.tasksUnCompleted());
		},
	"selectAllTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.selectAll();
			dispatch(actions.tasksSelected());
		},
	"unSelectAllTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.unSelectAll();
			dispatch(actions.tasksUnSelected());
		}
	/*"getMaxTodo":
		(): ThunkAction<number> =>
			(...args) => {
				const [ dispatch ,getState,{ createStoreParams }]= args;

				await dispatch(thunks.deleteTodo({ "todoId": 1 }));

				const { todos } = getState().manageTodos;

				return createStoreParams.maxTodo;
			}*/


};

export const selectors = (() => {
	const taskCount = (state: State) => {
		const { tasks: todos } = state.manageTasks;
		return todos.length;
	};

	const completedTaskCount = (state: State) => {
		const { tasks } = state.manageTasks;
		return tasks.filter(task => task.isCompleted).length;
	};

	const selectedTaskCount = (state: State) => {
		const { tasks } = state.manageTasks;
		return tasks.filter(task => task.isSelected).length;
	}

	const percentageOfTasksCompleted = createSelector(
		taskCount,
		completedTaskCount,
		selectedTaskCount,
		(taskCount, completedTaskCount) => (taskCount / completedTaskCount) * 100
	);

	return {
		taskCount,
		completedTaskCount,
		selectedTaskCount,
		percentageOfTasksCompleted,
	};
})();

