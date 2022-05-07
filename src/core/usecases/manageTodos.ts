import type { ThunkAction } from "../setup";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { State } from "../setup";
import { createSelector } from "@reduxjs/toolkit";
import type { Todo } from "../ports/TodoClient";
//import { createObjectThatThrowsIfAccessed } from "core/tools/createObjectThatThrowsIfAccessed";
import { flip } from "tsafe/flip";
import { id } from "tsafe/id";

export type ManageTodosState = {
	todos: Todo[];
};

export const { reducer, actions, name } = createSlice({
	"name": "manageTodos",
	"initialState": id<ManageTodosState>({ "todos": [] }),
	"reducers": {
		"initialized": (_state, { payload }: PayloadAction<{ todos: Todo[]; }>) => {
			const { todos } = payload;
			return { todos };
		},
		"todoDeleted": (state, { payload }: PayloadAction<{ id: number; }>) => {
			const { id: todoId } = payload;

			state.todos = state.todos.filter(todo => todo.id !== todoId);

		},
		"todoCreated": (state, { payload }: PayloadAction<{ todo: Todo }>) => {
			const { todo } = payload;
			state.todos.push({
				...todo
			})
		},
		"todoCompletedToggled": (state, { payload }: PayloadAction<{ id: number }>) => {
			const { id: todoId } = payload;

			const index = state.todos.findIndex(({ id }) => todoId === id);

			flip(state.todos[index], "isCompleted")

		},
		"todoSelectedToggled": (state, { payload }: PayloadAction<{ id: number }>) => {
			const { id: todoId } = payload;
			flip(
				state.todos[state.todos.findIndex(({ id }) => todoId === id)],
				"isSelected"
			)
		}

	},
});

export const privateThunks = {
	"initialize":
		(): ThunkAction =>
			async (...args) => {

				const [dispatch, , { todoClient }] = args;

				const todos = await todoClient.getTodos();

				dispatch(actions.initialized({ todos }));

			}
};

export const thunks = {
	"deleteTodo":
		(params: { id: number; }): ThunkAction =>
			async (...args) => {

				const { id } = params;

				const [dispatch, , { todoClient }] = args;
				await todoClient.deleteTodo({ id });
				dispatch(actions.todoDeleted({ id }));

			},
	"createTodo":
		(params: { message: string; }): ThunkAction =>
			async (...args) => {
				const { message } = params;
				const [dispatch, , { todoClient }] = args;
				await todoClient.createTodo({
					message
				});

				todoClient.getTodos().then(todos => {
					dispatch(actions.todoCreated({ "todo": todos[todos.length - 1] }))
				});

			},
	"toggleTodoIsCompleted":
		(params: { id: number; }): ThunkAction =>
			async (...args) => {

				const { id } = params;
				const [dispatch, , { todoClient }] = args;

				await todoClient.toggleTodoCompleted({ id });

				dispatch(actions.todoCompletedToggled({ id }))
			},
	"toggleTodoSelected": (params: { id: number }): ThunkAction =>
		async (...args) => {
			const { id } = params;
			const [dispatch, , { todoClient }] = args;

			await todoClient.toggleTodoSelected({ id });
			dispatch(actions.todoSelectedToggled({ id }));

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
	const todoCount = (state: State) => {
		const { todos } = state.manageTodos;
		return todos.length;
	};

	const completedTodoCount = (state: State) => {
		const { todos } = state.manageTodos;
		return todos.filter(todo => todo.isCompleted).length;
	};

	const selectedTodoCount = (state: State) => {
		const { todos } = state.manageTodos;
		return todos.filter(todo => todo.isSelected).length;
	}

	const percentageOfTodosCompleted = createSelector(
		todoCount,
		completedTodoCount,
		(todoCount, completedTodoCount) => (todoCount / completedTodoCount) * 100
	);

	return {
		todoCount,
		completedTodoCount,
		selectedTodoCount,
		percentageOfTodosCompleted,
	};
})();

