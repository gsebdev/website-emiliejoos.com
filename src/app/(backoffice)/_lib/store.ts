'use client';

import { EnhancedStore, ThunkDispatch, combineReducers, configureStore } from '@reduxjs/toolkit';
import { AuthState, authReducer } from './slices/authSlice';
import { UserState, userReducer } from './slices/userSlice';
import { PartnerState, partnersReducer } from './slices/partnersSlice';
import { ImagesState, imagesReducer } from './slices/imagesSlice';
import { PagesState, pagesReducer } from './slices/pagesSlice';
import { TestimonialState, testimonialsReducer } from './slices/testimonialsSlice';
import { PostsState, postsReducer } from './slices/postsSlice';

export interface RootStateInterface {
    auth: AuthState
    user: UserState
    partners: PartnerState
    images: ImagesState
    pages: PagesState
    testimonials: TestimonialState,
    posts: PostsState
}

const initialStoreState = {
    auth: {
        user: null,
        authenticated: null
    },
    user: {
        galleryOpen: false,
        selectedImagesIndex: [],
        partnerDialogOpen: {
            editing: false,
            open: false,
            partner: null
        }
    },
    partners: {
        items: [],
        status: 'idle',
        error: null
    },
    images: {
        items: [],
        status: 'idle',
        error: null
    },
    pages: {
        items: {},
        status: 'idle',
        error: null
    },
    testimonials: {
        status: "idle",
        items: [],
        error: null
    },
    posts: {
        items: [],
        status: 'idle',
        error: null
    }
} as RootStateInterface


const storeContainer: { store?: EnhancedStore } = {};

export const initializeStore = (preloadedState?: any) => {

    const combinedReducers = combineReducers({
        auth: authReducer,
        user: userReducer,
        partners: partnersReducer,
        images: imagesReducer,
        pages: pagesReducer,
        testimonials: testimonialsReducer,
        posts: postsReducer
    })

    const reducer = (state: any, action: any) => {

        if (action.type === 'RESET') {
            state = initialStoreState
        }
    
        return combinedReducers(state, action);
    }

    storeContainer['store'] = configureStore({
        reducer: reducer,
        preloadedState: {
            ...initialStoreState,
            ...preloadedState
        }
    });

    return storeContainer['store'];
}

export const { store } = storeContainer;


export type AppState = RootStateInterface;
export type AppDispatch = ThunkDispatch<AppState, any, any>;