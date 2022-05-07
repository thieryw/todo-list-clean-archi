import { memo } from "react";
import type { Task as TaskType } from "../core/ports/TodoListClient";
import { useThunks } from "ui/coreApi";
import { makeStyles } from "../theme";
import { useConstCallback } from "powerhooks/useConstCallback";
//import * as runEx from "run-exclusive";


export const Task = memo((props: TaskType) => {
	const { id, isCompleted, message, isSelected } = props;
	const { manageTasksThunks } = useThunks();

	const toggleIsCompleted = useConstCallback((e: React.MouseEvent<HTMLInputElement, MouseEvent>)=>{
			e.stopPropagation();
			manageTasksThunks.toggleTaskCompleted({ id })
	});

	const toggleIsTaskSelected = useConstCallback(()=>{
		manageTasksThunks.toggleTaskSelected({id});
	});

	const deleteTask = useConstCallback((e: React.MouseEvent<HTMLHeadingElement, MouseEvent>) => {
		e.stopPropagation();
		manageTasksThunks.deleteTask({ id });
	});

	const { classes } = useStyles({
		isCompleted,
		isSelected
	});
	return <div onClick={toggleIsTaskSelected} className={classes.root}>
		<input readOnly={true} onClick={toggleIsCompleted} checked={isCompleted} type="checkbox" />
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



