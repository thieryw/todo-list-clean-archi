
export type Todo = {
	id: number;
	message: string;
	isCompleted: boolean;
};

export type TodoClient = {
	getTodos: () => Promise<Todo[]>;
	createTodo: (params: { message: string; }) => Promise<Todo>;
	deleteTodo: (params: { id: number; }) => Promise<void>;
	setTodoCompleted: (params: { id: number; isCompleted: boolean; }) => Promise<void>;
};
