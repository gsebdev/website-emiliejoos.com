import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TestimonialType } from '../definitions';
import { handleAsyncThunkError } from '../utils';
import { toast } from 'sonner';
import { store } from '@/store';



/**
 * Testimonial State Definitions
 * 
 * 
 */

export interface TestimonialState {
    items: any[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

/**
 * 
 * Testimonial Slice
 * 
 * 
 */

export const { reducer: testimonialsReducer } = createSlice({
    name: 'testimonials',
    initialState: {
        items: [],
        status: 'idle',
        error: null
    } as TestimonialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTestimonials.pending, (state) => {
                state.status = 'loading'

            })
            .addCase(fetchTestimonials.fulfilled, (state, action) => {
                const { value } = action.payload.data;
                if (!value || !Array.isArray(value)) return;
                state.items = value
                state.status = 'succeeded'
            })
            .addCase(fetchTestimonials.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la récupération des temoignages'
            })
            .addCase(removeTestimonial.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setTestimonials.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setTestimonials.fulfilled, (state, action) => {
                const { value } = action.payload.data
                if (!value || !Array.isArray(value)) return;
                state.items = value
                state.status = 'succeeded'
            })
            .addCase(setTestimonials.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de l\'ajout du temoignage'
            })
            .addCase(removeTestimonial.fulfilled, (state, action) => {
                const { value } = action.payload.data
                if (!value || !Array.isArray(value)) return;
                state.items = value;
                state.status = 'succeeded'
            })
            .addCase(removeTestimonial.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la suppression du temoignage'
            })
    }
});


/**
 * 
 * Testimonials Async Thunks -- fetch on Next JS server Actions
 * 
 */

export const fetchTestimonials = createAsyncThunk("testimonials/fetchTestimonials", async () => {
    const response = await fetch(`/api/backend/testimonials`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        handleAsyncThunkError(`Failed to fetch testimonials: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {

        handleAsyncThunkError(data.error);
    }

    return data;
})

export const removeTestimonial = createAsyncThunk("testimonials/deleteTestimonial", async ({ id, notification = true }: { id: string, notification?: boolean }, { dispatch, getState }) => {
    
    if (!id || typeof id !== 'string') {
        handleAsyncThunkError('No index provided or bad type');
    }

    const testimonials = (getState() as any).testimonials.items.filter((t: TestimonialType) => t.id !== id);
    const response = await fetch(`/api/backend/testimonials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testimonials)
    });

    if (!response.ok) {
        handleAsyncThunkError(`Failed to delete testimonial: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        handleAsyncThunkError(data.error);
    }

    if (notification) {
        toast.success('Félicitations !', {
            description: 'Le temoignage a été supprimé avec succès.',
            action: {
                label: 'Annuler',
                onClick: () => {
                    dispatch(setTestimonials({
                        testimonials: data.prevState.value,
                        notification: false
                    }))
                }
            }
        })
    }

    return data;
})

export const setTestimonials = createAsyncThunk('testimonials/setTestimonials', async ({ testimonials, notification = true }: { testimonials: TestimonialType | TestimonialType[], notification?: boolean }, { dispatch, getState }) => {

    if (!Array.isArray(testimonials)) {
        testimonials = [
            ...(getState() as any).testimonials.items,
            testimonials
        ];
    }

    const response = await fetch(`/api/backend/testimonials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testimonials)
    });

    if (!response.ok) handleAsyncThunkError(`Échec de l'enregistrement des temoignages : ${response.status}`);

    const data = await response.json();

    if (!data.success) handleAsyncThunkError(data.error);

    if (notification) {
        toast.success('Félicitations !', {
            description: `Le temoignage a été ajouté avec succès.`,
            action: {
                label: 'Annuler',
                onClick: () => {
                    dispatch(setTestimonials({
                        testimonials: data.prevState.value,
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
 * Testimonials selectors
 * 
 */
export const selectAllTestimonials = (state: any) => state.testimonials.items
export const selectTestimonialByIndex = (state: any, i: number) => state.testimonials.items.find((_: TestimonialType, index: number) => index === i)
export const selectTestimonialsStatus = (state: any) => state.testimonials.status
export const selectError = (state: any) => state.testimonials.error