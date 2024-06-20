import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, AppState, store } from "../store";
import { UserType } from "@/app/_types/definitions";
import { fetchApi } from "../api";


/**
 * Auth State Definiton
 */
export interface AuthState {
    user: Partial<UserType>|null
    authenticated: | "pending" | "failed" | null | "success"
}

/**
 * 
 * Slice Auth
 * 
 */
export const { reducer: authReducer, actions: { setUser, setAuthenticated } } = createSlice({

    name: 'auth',

    initialState: {
        user: null,
        authenticated: null
    } as AuthState,

    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },

        setAuthenticated: (state, action) => {
            state.authenticated = action.payload
        }
    }
});

/**
 * 
 * Async Thunks
 * 
 * 
 */

export const getAuth = createAsyncThunk('auth/getAuth', async (_, { dispatch, getState }) => {

    const authenticated = (getState() as AppState).auth.authenticated;

    if (authenticated !== 'success') {

        dispatch(setAuthenticated("pending"));

    }

    try {

        const data = await fetchApi('login', {});

        if (!data.success) {

            throw new Error();

        }

        dispatch(setAuthenticated("success"));
        dispatch(setUser(data.data));

    } catch (e) {

        dispatch(setAuthenticated("failed"));
        dispatch(setUser(null));

    }


});

export const signUserOut = createAsyncThunk('auth/signUserOut', async (_, { dispatch }) => {

    try {

        const response = await fetch('/logout');

        if (!response.ok) {

            throw new Error('Failed to sign out');
        }

    } catch (error) {

        console.error(error);

    } finally {

        dispatch({ type: 'RESET' });

    }


})

/***
 * 
 * Selectors
 * 
 * 
 */

export const selectUser = (state: any) => state.auth.user;

export const selectAuthenticated = (state: any) => state.auth.authenticated;

export const selectAuth = (state: any) => state.auth;