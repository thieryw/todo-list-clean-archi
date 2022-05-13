
export type Task = {
	id: number;
	message: string;
	isCompleted: boolean;
	isSelected: boolean;
};

export type TodoListClient = {
	getTasks: () => Promise<Task[]>;
	createTask: (params: { message: string; }) => Promise<Task>;
	deleteTask: (params: { id: number; }) => Promise<void>;
	toggleTaskCompleted: (params: { id: number }) => Promise<void>;
	toggleTaskSelected: (params: {id: number}) => Promise<void>;
	deleteSelectedTasks: () => Promise<{deletedTaskIds: number[]}>;
	completeSelectedTasks: () => Promise<void>;
	unCompleteSelectedTasks: () => Promise<void>;
	selectAll: () => Promise<void>;
	unSelectAll: () => Promise<void>;
	deleteAll: () => Promise<void>;
	completeAll: () => Promise<void>;
	unCompleteAll: () => Promise<void>;
};

export function createTaskFlipBooleanValue<
	T extends {
		tasks: Task[];
		valueToFlip: {
			[Key in keyof Task]: Task[Key] extends boolean ? Key : never
		}[keyof Task]
	}
>(params: {
	action: (params: T)=> Promise<void>;
}): {taskFlipBooleanValue: (params: T) => Promise<void>} {
	const { action: taskFlipBooleanValue } = params;

	return { taskFlipBooleanValue };

};
