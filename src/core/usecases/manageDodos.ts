import type { ThunkAction } from "../setup";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { State } from "../setup";
import { createSelector } from "@reduxjs/toolkit";
import type { Todo } from "../ports/TodoClient";
import { createObjectThatThrowsIfAccessed } from "core/tools/createObjectThatThrowsIfAccessed";

export type ManageTodosState = {
	todos: Todo[];
};

export const { reducer, actions, name } = createSlice({
	"name": "manageTodos",
	"initialState": createObjectThatThrowsIfAccessed<ManageTodosState>({ "debugMessage": "The slice was not properly initialized" }),
	"reducers": {
		"initialized": (_state, { payload }: PayloadAction<{ todos: Todo[]; }>) => {
			const { todos } = payload;
			return { todos };
		},
		"todoDeleted": (state, { payload }: PayloadAction<{ todoId: number; }>) => {
			const { todoId } = payload;

			state.todos = state.todos.filter(todo => todo.id !== todoId);

		},
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
		(params: { todoId: number; }): ThunkAction =>
			async (...args) => {

				const { todoId } = params;

				const [dispatch, , { todoClient }] = args;
				await todoClient.deleteTodo({ "id": todoId });
				dispatch(actions.todoDeleted({ todoId }));

			},
	"getMaxTodo":
		(): ThunkAction<number> =>
			 (...args) => {
				const [ dispatch ,getState,{ createStoreParams }]= args;

				await dispatch(thunks.deleteTodo({ "todoId": 1 }));

				const { todos } = getState().manageTodos;

				return createStoreParams.maxTodo;
			}
	

};

export const selectors = (() => {
	const todoCount = (state: State) => {
		const { todos} = state.manageTodos;
		return todos.length;
	};

	const completedTodoCount = (state: State) => {
		const { todos } = state.manageTodos;
		return todos.filter(todo => todo.isCompleted).length;
	};

	const percentageOfTodosCompleted = createSelector(
		todoCount, 
		completedTodoCount, 
		(todoCount, completedTodoCount) => (todoCount/completedTodoCount)*100
	);

	return {
		todoCount,
		completedTodoCount,
		percentageOfTodosCompleted
	};
})();

