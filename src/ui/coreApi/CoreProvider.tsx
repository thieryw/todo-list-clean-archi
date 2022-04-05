
import { Provider as StoreProvider } from "react-redux";
import { createStore } from "core";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

//How you instantiate the store will vary from project to project.
//This is just a mere suggestion so you get the idea.

const prStore = createStore({ "maxTodo": 33 });

export function CoreProvider(props: { children: ReactNode }) {
    const { children } = props;

    const [store, setStore] = useState<Awaited<typeof prStore> | undefined>(undefined);

    useEffect(() => {
        prStore.then(setStore);
    }, []);

    if (store === undefined) {
        //Suggestion: display a splash screen
        return null;
    }

    return <StoreProvider store={store}>{children}</StoreProvider>;
}