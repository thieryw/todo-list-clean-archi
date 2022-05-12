import { memo, useState } from "react";
import {  useSelector, useThunks } from "ui/coreApi";
import { useConstCallback } from "powerhooks/useConstCallback";
import { Task } from "./Task";
import { makeStyles } from "../theme";
import { CommandBar } from "./CommandBar";

export const App = memo(
	() => {

		const [textValue, setTextValue] = useState("");

		const todos = useSelector(state => state.manageTasks.tasks);

		const { manageTasksThunks } = useThunks();

		const handleTextValueChange = useConstCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setTextValue(e.target.value);
		})

		const handleSubmit = useConstCallback((e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			manageTasksThunks.createTask({
				"message": textValue
			});

			setTextValue("");

		})

		const { classes } = useStyles();

		return (
			<div className={classes.root}>
				<h1>Todo List with Redux Clean Architecture and local storage</h1>
				<div className={classes.form}>
					<form onSubmit={handleSubmit}>
						<input type="text" value={textValue} onChange={handleTextValueChange} />
					</form>
				</div>
				<div className={classes.commandAndTasks}>
					<CommandBar />
					<div className={classes.tasks}>
						{
							todos.map(todo =>
								<Task key={todo.id} {...todo} />
							).reverse()
						}
					</div>
				</div>
			</div>
		);
	}
);

const useStyles = makeStyles()({
	"root": {
		"display": "flex",
		"flexDirection": "column",
		"justifyContent": "center",
		"alignItems": "center"
	},
	"form": {
		"marginBottom": 30
	},
	"commandAndTasks": {
		"display": "flex"
	},
	"tasks": {
		"marginLeft": 30
	}
})


