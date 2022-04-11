
export type Todo = {
	id: string;
	message: string;
	isCompleted: boolean;
};

export type TodoClient = {
	getTodos: () => Promise<Todo[]>;
	createTodo: (params: { message: string; }) => Promise<Todo>;
	deleteTodo: (params: { id: string; }) => Promise<void>;
	toggleTodoCompleted: (params: { id: string }) => Promise<void>;
};

