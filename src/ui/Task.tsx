import { memo, useState } from "react";
import type { Task as TaskType } from "../core/ports/TodoListClient";
import { useThunks } from "ui/coreApi";
import { makeStyles } from "../theme";
import { useConstCallback } from "powerhooks/useConstCallback";

async function loader<T>(params: {
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	callBack: (params: T) => Promise<void>;
	callBackParams: T
}) {
	const { callBack, setIsLoading, callBackParams } = params;
	setIsLoading(true);
	await callBack(callBackParams);
	setIsLoading(false);
}

export const Task = memo((props: TaskType) => {
	const { id, isCompleted, message, isSelected } = props;
	const [isLoading, setIsLoading] = useState(false);
	const { toggleTaskCompleted, toggleTaskSelected, deleteTask  } = useThunks().manageTasksThunks;

	const toggleIsCompleted = useConstCallback((e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
		e.stopPropagation();
		loader({
			setIsLoading,
			"callBack": toggleTaskCompleted,
			"callBackParams": {id}
		})
	});

	const toggleIsTaskSelected = useConstCallback(() => {
		loader({
			"callBack": toggleTaskSelected,
			setIsLoading,
			"callBackParams": { id }
		})
	});

	const handleDelete = useConstCallback((e: React.MouseEvent<HTMLHeadingElement, MouseEvent>) => {
		e.stopPropagation();
		setIsLoading(true);
		deleteTask({ id });
	});

	const { classes } = useStyles({
		isCompleted,
		isSelected,
		isLoading
	});

	return <div onClick={toggleIsTaskSelected} className={classes.root}>
		<input className={classes.checkBox} readOnly={true} onClick={toggleIsCompleted} checked={isCompleted} type="checkbox" />
		<p className={classes.message}>{isLoading ? "Loading" : message}</p>
		<h2 className={classes.deleteButton} onClick={handleDelete}>X</h2>
	</div>
});


const useStyles = makeStyles<{ isCompleted: boolean; isSelected: boolean; isLoading: boolean }>()(
	(...[, { isCompleted, isSelected, isLoading }]) => ({
		"root": {
			"width": 400,
			"height": 50,
			"border": "solid grey 1px",
			"display": "flex",
			"justifyContent": "space-between",
			"alignItems": "center",
			"padding": "0px 10px 0px 10px",
			"backgroundColor": isSelected ? "black" : undefined,
			"pointerEvents": isLoading ? "none" : undefined

		},
		"message": {
			"textDecoration": isCompleted && !isLoading ? "line-through" : undefined,
			"color": isSelected ? "white" : undefined
		},
		"deleteButton": {
			"cursor": "pointer",
			"color": isSelected ? "white" : undefined
		},
		"checkBox": {
		}
	}))



