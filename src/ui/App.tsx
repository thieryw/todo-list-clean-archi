import { memo, useState } from "react";
import {  useSelector, useThunks } from "ui/coreApi";
import { useConstCallback } from "powerhooks/useConstCallback";
import { Task } from "./Task";
import { makeStyles } from "../theme";

export const App = memo(
	() => {

		const [textValue, setTextValue] = useState("");

		const todos = useSelector(state => state.manageTodos.todos);

		const { manageTodosThunks } = useThunks();

		const handleTextValueChange = useConstCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setTextValue(e.target.value);
		})

		const handleSubmit = useConstCallback((e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			manageTodosThunks.createTodo({
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

				<div>
					{
						todos.map(todo =>
							<Task key={todo.id} {...todo} />
						).reverse()
					}
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
	}
})


