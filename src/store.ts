import { configureStore } from '@reduxjs/toolkit';
import { partnersReducer } from './lib/slices/partnersSlice';
import { userReducer } from './lib/slices/userSlice';
import { imagesReducer } from './lib/slices/imagesSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        partners: partnersReducer,
        images: imagesReducer
    },
})


