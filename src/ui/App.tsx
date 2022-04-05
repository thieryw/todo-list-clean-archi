
import { memo, useMemo } from "react";
import { selectors, useSelector, useThunks } from "ui/coreApi";

export const App = memo(
	()=>{

		const todos = useSelector(state=> state.manageTodos.todos);

		const { percentageOfTodosCompleted } = useSelector(selectors.manageTodos.percentageOfTodosCompleted);
		const { todoCount } = useSelector(selectors.manageTodos.todoCount);

		const { manageTodosThunks } = useThunks();

		//manageTodosThunks.deleteTodo({ "todoId": 33 });

		const maxTodo = useMemo(()=> manageTodosThunks.getMaxTodo(), [manageTodosThunks]);

		return (
			<div>
				{maxTodo}
				{
				todos.map(todo=>
					<div>{JSON.stringify(todo)}</div>
				)
				}</div>
		);


	}
);
