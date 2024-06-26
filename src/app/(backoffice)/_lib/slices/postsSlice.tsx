import { sortByDisplayOrder } from "@/app/_lib/client-utils";
import { PostType } from "@/app/_types/definitions";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handleAsyncThunkError } from "../utils";
import { fetchBackendApi } from "../api";
import { toast } from "sonner";

/**
 * PostType State Definitions
 */
export interface PostsState {
    items: PostType[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

/**
 * Posts Slice
 */
const { reducer: postsReducer } = createSlice({

    name: 'posts',

    initialState: {
        items: [],
        status: 'idle',
        error: null
    } as PostsState,

    reducers: {},
    extraReducers: (builder) => {
        builder

            // Posts Async Thunks -- when pending
            .addCase(fetchPosts.pending, (state) => {
                state.status = 'loading'

            })
            .addCase(removePost.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(createPost.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(patchPosts.pending, (state) => {
                state.status = 'loading'
            })

            // Posts Async Thunks -- when reject with error
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la récupération des posts'
            })
            .addCase(createPost.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de l\'ajout du post'
            })
            .addCase(removePost.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la suppression du post'
            })
            .addCase(patchPosts.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la mise à jour des posts'
            })


            // Posts Async Thunks -- when fulfilled
            .addCase(createPost.fulfilled, (state, action) => {

                const { data } = action.payload

                if (!data) return;

                state.items.push(data);

                state.status = 'succeeded';

            })
            .addCase(fetchPosts.fulfilled, (state, action) => {

                const { data, isSingle } = action.payload;

                if (!data) return;

                if (!isSingle) {
                    state.items = data

                } else {
                    const index = state.items.findIndex((item: PostType) => item.id === data.id)
                    if (index !== -1) {
                        state.items[index] = data
                    } else {
                        state.items.push(data)
                    }
                }

                state.items.sort(sortByDisplayOrder)
                state.status = 'succeeded'
            })
            .addCase(removePost.fulfilled, (state, action) => {
                const { prevState } = action.payload;

                if (!prevState) return;

                const { id } = prevState;

                state.items = state.items.filter(partner => partner.id !== id);

                state.status = 'succeeded';
            })
            .addCase(patchPosts.fulfilled, (state, action) => {

                const { data } = action.payload;
                if (!data) return;

                state.items = state.items.map(post => {
                    const fIndex = data.findIndex((p: PostType) => p.id === post.id)
                    if (fIndex !== -1) {
                        return data[fIndex]
                    }
                    return post
                });

                state.items.sort(sortByDisplayOrder);

                state.status = 'succeeded';
            })
    }
});


/**
 * Posts Async Thunks -- fetch on API
 */
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (id?: number) => {
    const data = await fetchBackendApi(`posts${id ? `/${id}` : ''}`, {});

    if (!data.success) {
        handleAsyncThunkError(`Erreur de récupération des posts : ${data.error}`);
    }

    return { ...data, isSingle: !!id };
});

export const removePost = createAsyncThunk("posts/deletePost", async ({ id, notification = true }: { id: number, notification?: boolean }, { dispatch }) => {
    if (!id) {
        handleAsyncThunkError('No ID provided');
    }
    const data = await fetchBackendApi(`posts/${id}`, {
        method: 'DELETE'
    });

    if (!data.success) {
        handleAsyncThunkError(`Failed to delete post: ${data.error}`);
    }

    if (notification) {
        toast.success('Félicitations !', {
            description: 'Le post a été supprimé avec succès.',
            action: {
                label: 'Annuler',
                onClick: () => {
                    dispatch(createPost({
                        post: { ...data.prevState, id: undefined, created_at: undefined, updated_at: undefined },
                        notification: false
                    }))
                }
            }
        })
    }

    return data;
});

export const createPost = createAsyncThunk('posts/createPost', async ({ post, notification = true }: { post: PostType, notification?: boolean }, { dispatch }) => {
    const { title } = post;

    if (!title) handleAsyncThunkError('champs manquants');

    const data = await fetchBackendApi(`posts`, {
        method: 'POST',
        body: JSON.stringify(post)
    });

    if (!data.success) handleAsyncThunkError(`Échec de la création du post : ${data.error}`);

    if (notification) {
        toast.success('Félicitations !', {
            description: `Le post a été ajouté avec succès.`,
            action: {
                label: 'Annuler',
                onClick: () => {
                    dispatch(removePost({
                        id: data.data.id,
                        notification: false
                    }))
                }
            }
        })
    }
    return data;
});

export const patchPosts = createAsyncThunk('posts/patchPosts', async ({ posts, notification = true }: { posts: Partial<PostType>[], notification?: boolean }, { dispatch }) => {

    if (!posts.length) handleAsyncThunkError('Aucun post');

    posts.forEach((post) => {
        if (!post.id || Object.keys(post).length < 2) handleAsyncThunkError('champs manquants');
    });

    const data = await fetchBackendApi(`posts`, {
        method: 'PATCH',
        body: JSON.stringify(posts)
    });

    if (!data.success) handleAsyncThunkError(`Échec de la modification du/des Post(s) : ${data.error}`);

    if (notification) {
        toast.success('Félicitations !', {
            description: `Le(s) post(s) a/ont été modifié(s) avec succès.`,
            action: {
                label: 'Annuler',
                onClick: () => {
                    dispatch(patchPosts({
                        posts: data.prevState,
                        notification: false
                    }))
                }
            }
        })
    }
    return data;
});


/**
 * Posts selectors
 */
export const selectAllPosts = (state: any) => state.posts.items;
export const selectPostById = (id: number) => (state: any) => state.posts.items.find((item: PostType) => item.id === id);
export const selectPostsStatus = (state: any) => state.posts.status;
export const selectError = (state: any) => state.posts.error;

export { postsReducer }