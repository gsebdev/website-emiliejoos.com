import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deletePartner, getPartners, savePartner } from '@/lib/actions';
import { Partner } from '../definitions';



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

export const { reducer: partnersReducer, actions: { setPartnerResolvedAction } } = createSlice({
    name: 'partners',
    initialState: {
        items: [],
        status: 'idle',
        resolvedAction: null,
        error: null
    } as PartnerState,
    reducers: {
        setPartnerResolvedAction: (state, action) => {
            state.resolvedAction = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPartners.pending, (state) => {
                state.status = 'loading'
                
            })
            .addCase(fetchPartners.fulfilled, (state, action) => {
                if (!action.payload) return;
                if (!action.payload?.success) {
                    state.status = 'failed'
                    state.error = action.payload?.error
                    return;
                }
                if(Array.isArray(action.payload.data)) {
                    state.items = action.payload.data
                    state.items.sort(sortPartnersByDisplayOrder)
                } else {
                    state.items.push(action.payload.data)
                    state.items.sort(sortPartnersByDisplayOrder)
                }
                state.status = 'succeeded'
                state.resolvedAction = 'get'
            })
            .addCase(fetchPartners.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error?.message ?? 'Une erreur est survenue lors de la récupération des partenaires'
            })
            .addCase(removePartner.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setPartner.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setPartner.fulfilled, (state, action) => {
                const isNewPartner = action.payload?.prevState?.id ? false : true

                if (isNewPartner && action.payload?.data) {
                    state.items.push(action.payload?.data)
                    state.items.sort(sortPartnersByDisplayOrder)
                } else {
                    state.items = state.items.map(partner =>
                        partner.id === action.payload?.data?.id ? action.payload?.data : partner
                    ).sort(sortPartnersByDisplayOrder)
                }
                state.status = 'succeeded'
                state.resolvedAction = isNewPartner ? 'add' : 'update'
            })
            .addCase(setPartner.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload && typeof action.payload === 'string' ? action.payload : (action.error?.message ?? 'Une erreur est survenue lors de l\'ajout du partenaire')
            })
            .addCase(removePartner.fulfilled, (state, action) => {
                if (!action?.payload?.success) {
                    state.status = 'failed'
                    state.error = action.payload?.error
                    return;
                }
                const { id } = action.payload.prevState ?? {};
                state.items = state.items.filter(partner =>
                    partner.id !== id)
                state.status = 'succeeded'
                state.resolvedAction = 'delete'
            })
            .addCase(removePartner.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error?.message ?? 'Une erreur est survenue lors de la suppression du partenaire'
            })
    }
});


/**
 * 
 * Partners Async Thunks -- fetch on Next JS server Actions
 * 
 */

export const fetchPartners = createAsyncThunk("partners/fetchPartners", async () => {
    const response = await getPartners();
    return response
})

export const removePartner = createAsyncThunk("partners/deletePartner", async (id: number) => {
    const response = await deletePartner(id);
    return response
})

export const setPartner = createAsyncThunk('partners/setPartner', async (partner: Partner, { rejectWithValue }) => {
    const { title, url, logo, description, id, display_order } = partner;
    
    if(!title || !url || !logo || !description || typeof display_order !== 'number') return rejectWithValue('champs manquants');
    
    try {
        const response = await savePartner(title, url, logo, description, display_order, id);

        if(!response.success) throw new Error(response.error);

        return response
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
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