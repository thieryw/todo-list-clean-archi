import { memo } from "react";
import type { Todo } from "../core/ports/TodoClient";
import { useThunks } from "ui/coreApi";
import { makeStyles } from "../theme";
import { useConstCallback } from "powerhooks/useConstCallback";


export const Task = memo((props: Todo) => {
	const { id: todoId, isCompleted, message } = props;
	const { manageTodosThunks } = useThunks();

	const toggleIsCompleted = useConstCallback(()=>{
		manageTodosThunks.toggleTodoIsCompleted({todoId})
	})

	const deleteTask = useConstCallback(()=>{
		manageTodosThunks.deleteTodo({todoId});
	});

	const { classes } = useStyles({
		isCompleted
	});
	return <div className={classes.root}>
		<input onClick={toggleIsCompleted} defaultChecked={isCompleted} type="checkbox" />
		<p className={classes.message}>{message}</p>
		<h2 className={classes.deleteButton} onClick={deleteTask}>X</h2>
	</div>
});


const useStyles = makeStyles<{isCompleted: boolean}>()(
	(...[, {isCompleted}]) => ({
	"root": {
		"width": 400,
		"height": 50,
		"border": "solid grey 1px",
		"display": "flex",
		"justifyContent": "space-between",
		"alignItems": "center",
		"padding": "0px 10px 0px 10px"

	},
	"message": {
		"textDecoration": isCompleted ? "line-through" : undefined
	},
	"deleteButton": {
		"cursor": "pointer"

	}
}))



