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

		<button onClick={deleteSelectedTasks}>Delete Tasks</button>
		<button onClick={completeSelectedTasks}>Complete Tasks</button>
		<button onClick={unCompleteSelectedTasks}>Un Complete Tasks</button>
		<button onClick={selectAllTasks}>Select all</button>
		<button onClick={unSelectAllTasks}>Un select all</button>
	</div>

});

const useStyles = makeStyles()({
	"root": {
		"display": "flex",
		"marginBottom": 30
	}
})