import { memo } from "react";
import type { Todo } from "../core/ports/TodoClient";
import { useThunks } from "ui/coreApi";
import { makeStyles } from "../theme";
import { useConstCallback } from "powerhooks/useConstCallback";
//import * as runEx from "run-exclusive";


export const Task = memo((props: Todo) => {
	const { id, isCompleted, message, isSelected } = props;
	const { manageTodosThunks } = useThunks();

	const toggleIsCompleted = useConstCallback((e: React.MouseEvent<HTMLInputElement, MouseEvent>)=>{
			e.stopPropagation();
			manageTodosThunks.toggleTodoIsCompleted({ id })
	});

	const toggleIsTaskSelected = useConstCallback(()=>{
		manageTodosThunks.toggleTodoSelected({id});
	});

	const deleteTask = useConstCallback(() => {
		manageTodosThunks.deleteTodo({ id });
	});

	const { classes } = useStyles({
		isCompleted,
		isSelected
	});
	return <div onClick={toggleIsTaskSelected} className={classes.root}>
		<input onClick={toggleIsCompleted} defaultChecked={isCompleted} type="checkbox" />
		<p className={classes.message}>{message}</p>
		<h2 className={classes.deleteButton} onClick={deleteTask}>X</h2>
	</div>
});


const useStyles = makeStyles<{ isCompleted: boolean; isSelected: boolean }>()(
	(...[, { isCompleted, isSelected }]) => ({
		"root": {
			"width": 400,
			"height": 50,
			"border": "solid grey 1px",
			"display": "flex",
			"justifyContent": "space-between",
			"alignItems": "center",
			"padding": "0px 10px 0px 10px",
			"backgroundColor": isSelected ? "black" : undefined

		},
		"message": {
			"textDecoration": isCompleted ? "line-through" : undefined,
			"color": isSelected ? "white" : undefined
		},
		"deleteButton": {
			"cursor": "pointer",
			"color": isSelected ? "white" : undefined

		}
	}))



