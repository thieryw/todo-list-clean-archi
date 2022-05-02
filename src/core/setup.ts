
import type { Action, ThunkAction as GenericThunkAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { id } from "tsafe/id";
import type { TodoClient } from "./ports/TodoClient";
//import { createLocalStorageTodoClient } from "./secondaryAdapters/createLocalStorageTodoClient";
import { usecasesToReducer } from "redux-clean-architecture";
import { createRestApiTodoClient } from "./secondaryAdapters/createRestApiTodoClient";

import * as manageDodoUsecase from "./usecases/manageTodos";

export const usecases = [manageDodoUsecase];

export type CreateStoreParams = { maxTodo: number; };

export type ThunksExtraArgument = {
    createStoreParams: CreateStoreParams;
    todoClient: TodoClient;
};

export async function createStore(params: CreateStoreParams) {

    const todoClient = createRestApiTodoClient();

    const store = configureStore({
        "reducer": usecasesToReducer(usecases),
        "middleware": getDefaultMiddleware =>
            getDefaultMiddleware({
                "thunk": {
                    "extraArgument": id<ThunksExtraArgument>({
                        "createStoreParams": params,
                        todoClient
                    }),
                },
            })
    });

    await store.dispatch(manageDodoUsecase.privateThunks.initialize());

    return store;
}

type Store = Awaited<ReturnType<typeof createStore>>;

export type Dispatch = Store["dispatch"];

export type State = ReturnType<Store["getState"]>;

export type ThunkAction<RtnType = Promise<void>> = GenericThunkAction<
    RtnType,
    State,
    ThunksExtraArgument,
    Action<string>
>;