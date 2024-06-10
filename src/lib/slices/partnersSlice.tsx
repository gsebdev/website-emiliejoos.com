import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Partner } from '../definitions';
import { store } from '@/store';
import { handleAsyncThunkError } from '../utils';
import { toast } from 'sonner';



/**
 * Partner State Definitions
 * 
 * 
 */

export interface PartnerState {
    items: any[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null,
    resolvedAction: string | null | undefined
}

/**
 * 
 * Partner Slice
 * 
 * 
 */
const sortPartnersByDisplayOrder = (a: Partner, b: Partner) => a.display_order - b.display_order

export const { reducer: partnersReducer } = createSlice({
    name: 'partners',
    initialState: {
        items: [],
        status: 'idle',
        resolvedAction: null,
        error: null
    } as PartnerState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPartners.pending, (state) => {
                state.status = 'loading'

            })
            .addCase(fetchPartners.fulfilled, (state, action) => {
                const { data } = action.payload;
                if (!data) return;
                if (Array.isArray(data)) {
                    state.items = data
                } else {
                    state.items.push(data)
                }
                state.items.sort(sortPartnersByDisplayOrder)
                state.status = 'succeeded'
            })
            .addCase(fetchPartners.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la récupération des partenaires'
            })
            .addCase(removePartner.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setPartner.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setPartner.fulfilled, (state, action) => {
                const { data, prevState } = action.payload
                if (!data) return;

                const isNewPartner = prevState?.id ? false : true

                if (isNewPartner) {
                    state.items.push(data)
                } else {
                    state.items = state.items.map(partner =>
                        partner.id === data.id ? data : partner
                    )
                }
                state.items.sort(sortPartnersByDisplayOrder)
                state.status = 'succeeded'
            })
            .addCase(setPartner.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de l\'ajout du partenaire'
            })
            .addCase(removePartner.fulfilled, (state, action) => {
                const { prevState } = action.payload;
                if (!prevState) return;
                const { id } = prevState;
                state.items = state.items.filter(partner =>
                    partner.id !== id)
                state.status = 'succeeded'
            })
            .addCase(removePartner.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la suppression du partenaire'
            })
    }
});


/**
 * 
 * Partners Async Thunks -- fetch on Next JS server Actions
 * 
 */

export const fetchPartners = createAsyncThunk("partners/fetchPartners", async () => {
    const response = await fetch(`/api/backend/partners`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        handleAsyncThunkError(`Failed to fetch partners: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {

        handleAsyncThunkError(data.error);
    }

    return data;
})

export const removePartner = createAsyncThunk("partners/deletePartner", async ({ id, notification = true }: { id: number, notification?: boolean }, { dispatch }) => {
    if (!id) {
        handleAsyncThunkError('No ID provided');
    }
    const response = await fetch(`/api/backend/partners/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        handleAsyncThunkError(`Failed to delete partner: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        handleAsyncThunkError(data.error);
    }

    if (notification) {
        toast.success('Félicitations !', {
            description: 'Le partenaire a été supprimé avec succès.',
            action: {
                label: 'Annuler',
                onClick: () => {
                    dispatch(setPartner({
                        partner: { ...data.prevState, id: 0 },
                        notification: false
                    }))
                }
            }
        })
    }

    return data;
})

export const setPartner = createAsyncThunk('partners/setPartner', async ({ partner, notification = true }: { partner: Partner, notification?: boolean }, { dispatch }) => {
    const { title, url, logo, description, id, display_order } = partner;

    if (!title || !url || !logo || !description || typeof display_order !== 'number') handleAsyncThunkError('champs manquants');

    const response = await fetch(`/api/backend/partners${id ? `/${id}` : ""}`, {
        method: id ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            url,
            logo,
            description,
            id,
            display_order
        })
    });

    if (!response.ok) handleAsyncThunkError(`Échec de l'enregistrement du partenaire : ${response.status}`);

    const data = await response.json();

    if (!data.success) handleAsyncThunkError(data.error);

    if (notification) {
        toast.success('Félicitations !', {
            description: `Le partenaire ${id ? 'a été modifié avec succès.' : 'a été ajouté avec succès.'}`,
            action: {
                label: 'Annuler',
                onClick: () => {
                    if (id) {
                        dispatch(setPartner({
                            partner: data.prevState,
                            notification: false
                        }))
                    } else {
                        dispatch(removePartner({
                            id: data.data.id,
                            notification: false
                        }))
                    }
                }
            }
        })
    }
    return data;
})


/**
 * 
 * Partners selectors
 * 
 */
export const selectAllPartners = (state: any) => state.partners.items
export const selectPartnerById = (state: any, id: number) => state.partners.items.find((item: Partner) => item.id === id)
export const selectPartnersStatus = (state: any) => state.partners.status
export const selectError = (state: any) => state.partners.error
export const selectResolvedAction = (state: any) => state.partners.resolvedAction