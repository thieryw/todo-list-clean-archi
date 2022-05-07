
export type Todo = {
	id: number;
	message: string;
	isCompleted: boolean;
	isSelected: boolean;
};

export type TodoClient = {
	getTodos: () => Promise<Todo[]>;
	createTodo: (params: { message: string; }) => Promise<Todo>;
	deleteTodo: (params: { id: number; }) => Promise<void>;
	toggleTodoCompleted: (params: { id: number }) => Promise<void>;
	toggleTodoSelected: (params: {id: number}) => Promise<void>;
};

export function createTaskFlipBooleanValue<
	T extends {
		id: number;
		valueToFlip: {
			[Key in keyof Todo]: Todo[Key] extends boolean ? Key : never
		}[keyof Todo]
	}
>(params: {
	action: (params: T)=> Promise<void>;
}): {taskFlipBooleanValue: (params: T) => void} {
	const { action: taskFlipBooleanValue } = params;

	return { taskFlipBooleanValue };

};
