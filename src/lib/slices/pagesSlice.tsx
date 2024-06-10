import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PageType } from '../definitions';
import { handleAsyncThunkError } from '../utils';
import { toast } from 'sonner';



/**
 * Partner State Definitions
 * 
 * 
 */

export interface PagesState {
    items: { [slug: string]: PageType },
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

/**
 * 
 * Pages Slice
 * 
 * 
 */

export const { reducer: pagesReducer } = createSlice({
    name: 'pages',
    initialState: {
        items: {},
        status: 'idle',
        error: null
    } as PagesState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPages.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchPages.fulfilled, (state, action) => {
                const { data } = action.payload;
                if (!data) return;
                if (Array.isArray(data)) {
                    data.map(page => {
                        state.items[page.slug] = page
                    });
                } else {
                    state.items[data.slug] = data
                }
                state.status = 'succeeded'
            })
            .addCase(fetchPages.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la récupération de la page'
            })
            .addCase(setPage.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setPage.fulfilled, (state, action) => {
                const { data } = action.payload;
                if (!data) return;
                state.items[data.slug] = data
                state.status = 'succeeded'
            })
            .addCase(setPage.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Une erreur est survenue lors de la modification de la page'
            })
    }
});


/**
 * 
 * Pages Async Thunks -- fetch on API
 * 
 */

export const fetchPages = createAsyncThunk("pages/fetchPages", async (pageSlug?: string | string[]) => {
    const response = await fetch(`/api/backend/pages${pageSlug ? `/${pageSlug}` : ''}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        handleAsyncThunkError(`Failed to fetch page(s): ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        handleAsyncThunkError(`Failed to fetch page(s): ${data.error}`);
    }

    return data;
})

export const setPage = createAsyncThunk('pages/setPage', async ({ page, notification = true }: { page: PageType, notification?: boolean }, { dispatch }): Promise<{ data: PageType, prevState: PageType, success: boolean }> => {
    const response = await fetch('/api/backend/pages/' + page.slug, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(page)
    });



    if (!response.ok) {
        handleAsyncThunkError(`Failed to save page: ${response.status}`);
    }


    const data = await response.json();

    if (!data.success) {
        handleAsyncThunkError(`Failed to save page: ${data.error}`);
    }
    if (notification) {
        toast.success('Félicitations !', {
            description: 'La page a bien été sauvegardée',
            action: {
                label: 'Annuler',
                onClick: () => {
                    dispatch(setPage({
                        page: data.prevState,
                        notification: false
                    }))
                }
            }
        })
    }

    return data;
})


/**
 * 
 * Pages selectors
 * 
 */
export const selectAllPages = (state: any) => state.pages.items
export const selectPageBySlug = (slug: string) => (state: any) => state.pages.items[slug]
export const selectPagesStatus = (state: any) => state.pages.status
export const selectPagesError = (state: any) => state.pages.error
export const selectResolvedAction = (state: any) => state.pages.resolvedAction