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
		"tasksCompletedSet": ({ tasks }, { payload }: PayloadAction<{ isCompleted: boolean; allOfThem: boolean }>) => {
			const { isCompleted, allOfThem } = payload;

			tasks
				.filter(task => {
					if(allOfThem){
						return task.isCompleted !== isCompleted;
					}
					return task.isSelected && task.isCompleted !== isCompleted;
				})
				.forEach(task => {
				task.isCompleted = isCompleted;
			});
		},
		"tasksSelectedSet": ({ tasks }, { payload }: PayloadAction<{ isSelected: boolean }>) => {
			const { isSelected } = payload;
			tasks.filter(
				task => isSelected ? !task.isSelected : task.isSelected
			).forEach(task => {
				task.isSelected = isSelected;
			});
		},
		"tasksDeleted": (state, { payload }: PayloadAction<{ deletedTaskIds?: number[] }>) => {
			const { deletedTaskIds } = payload;
			const { tasks } = state;
			if (deletedTaskIds === undefined) {
				state.tasks = [];
				return;
			}
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
				dispatch(actions.tasksDeleted({
					"deletedTaskIds": [id]
				}));

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
			dispatch(actions.tasksCompletedSet({ "isCompleted": true, "allOfThem": false }));
		},
	"unCompleteSelectedTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.unCompleteSelectedTasks();
			dispatch(actions.tasksCompletedSet({ "isCompleted": false, "allOfThem": false }));
		},
	"selectAllTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.selectAll();
			dispatch(actions.tasksSelectedSet({ "isSelected": true }));
		},
	"unSelectAllTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.unSelectAll();
			dispatch(actions.tasksSelectedSet({ "isSelected": false }));
		},
	"deleteAllTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.deleteAll();
			dispatch(actions.tasksDeleted({}))
		},
	"completeAllTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.completeAll();
			dispatch(actions.tasksCompletedSet({ "isCompleted": true, "allOfThem": true }))

		},
	"unCompleteAllTasks": (): ThunkAction =>
		async (...args) => {
			const [dispatch, , { todoClient }] = args;
			await todoClient.unCompleteAll();
			dispatch(actions.tasksCompletedSet({ "isCompleted": false, "allOfThem": true }))
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

