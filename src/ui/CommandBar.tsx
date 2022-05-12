import { memo } from "react";
import { makeStyles } from "../theme";
import { useThunks } from "ui/coreApi";
import { useConstCallback } from "powerhooks/useConstCallback";

export const CommandBar = memo(() => {
	const { manageTasksThunks } = useThunks();

	const { classes } = useStyles();

	const deleteSelectedTasks = useConstCallback(()=>{
		manageTasksThunks.deleteSelectedTasks();
	});
	const completeSelectedTasks = useConstCallback(()=> {
		manageTasksThunks.completeSelectedTasks();
	})
	const unCompleteSelectedTasks = useConstCallback(()=>{
		manageTasksThunks.unCompleteSelectedTasks();
	})
	const selectAllTasks = useConstCallback(()=>{
		manageTasksThunks.selectAllTasks();
	});
	const unSelectAllTasks = useConstCallback(()=>{
		manageTasksThunks.unSelectAllTasks();
	})

	return <div className={classes.root}>
		{
			[
				{
					"name": "Delete selected tasks",
					"cb": deleteSelectedTasks
				},
				{
					"name": "Complete selected tasks",
					"cb": completeSelectedTasks
				},
				{
					"name": "unComplete selected tasks",
					"cb": unCompleteSelectedTasks
				},
				{
					"name": "Select all tasks",
					"cb": selectAllTasks
				},
				{
					"name": "unSelect all tasks",
					"cb": unSelectAllTasks
				},
			].map(({cb, name}) => <button key={name} className={classes.button} onClick={cb}>{name}</button>)
		}
	</div>

});

const useStyles = makeStyles()({
	"root": {
		"display": "flex",
		"marginBottom": 30,
		"flexDirection": "column"
	},
	"button": {
		"marginBottom": 10
	}
})