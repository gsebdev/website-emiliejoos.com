'use client'

import { PropsWithChildren } from "react"
import { RootStateInterface, initializeStore } from "../_lib/store";
import { Provider } from "react-redux";

interface StoreProviderProps {
    preloadedState: Partial<RootStateInterface>
}

const StoreProvider: React.FC<PropsWithChildren<StoreProviderProps>> = ({ children, preloadedState }) => {
    
    return (
        <Provider store={initializeStore(preloadedState)}>
            {children}
        </Provider>
    )
}

export default StoreProvider;