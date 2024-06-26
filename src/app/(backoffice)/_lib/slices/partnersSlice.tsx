import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { handleAsyncThunkError } from '../utils';
import { toast } from 'sonner';
import { fetchBackendApi } from '../api';
import { PartnerType } from '@/app/_types/definitions';
import { sortByDisplayOrder } from '@/app/_lib/client-utils';


/**
 * PartnerType State Definitions
 */
export interface PartnerState {
    items: any[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

/**
 * Partners Slice
 */
const { reducer: partnersReducer, actions } = createSlice({

    name: 'partners',

    initialState: {
        items: [],
        status: 'idle',
        error: null
    } as PartnerState,

    reducers: {},
    extraReducers: (builder) => {
        builder

            // Partners Async Thunks -- when pending
            .addCase(fetchPartners.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(removePartner.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(setPartner.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(patchParners.pending, (state) => {
                state.status = 'loading';
            })

            // Partners Async Thunks -- when rejected with an error
            .addCase(patchParners.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la mise à jour des partenaires'
            })
            .addCase(fetchPartners.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la récupération des partenaires'
            })
            .addCase(setPartner.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de l\'ajout du partenaire'
            })
            .addCase(removePartner.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la suppression du partenaire'
            })

            // Partners Async Thunks -- when fulfilled
            .addCase(fetchPartners.fulfilled, (state, action) => {
                const { data, isSingle } = action.payload;

                if (!data) return;

                if (!isSingle) {
                    state.items = data

                } else {
                    const index = state.items.findIndex((item: PartnerType) => item.id === data.id)
                    if (index !== -1) {
                        state.items[index] = data
                    } else {
                        state.items.push(data)
                    }
                }

                state.items.sort(sortByDisplayOrder);
                state.status = 'succeeded';

            })
            .addCase(setPartner.fulfilled, (state, action) => {
                const { data, isCreateNew } = action.payload
                if (!data) return;

                if (isCreateNew) {

                    state.items.push(data);

                } else {

                    state.items = state.items.map(partner =>
                        partner.id === data.id ? data : partner
                    )

                }

                state.items.sort(sortByDisplayOrder);
                state.status = 'succeeded';
            })
            .addCase(removePartner.fulfilled, (state, action) => {
                const { prevState } = action.payload;
                if (!prevState) return;

                const { id } = prevState;
                state.items = state.items.filter(partner => partner.id !== id);
                state.status = 'succeeded';
            })
            .addCase(patchParners.fulfilled, (state, action) => {
                const { data } = action.payload;
                if (!data) return;

                state.items = state.items.map(partner => {
                    const fIndex = data.findIndex((p: PartnerType) => p.id === partner.id)
                    if (fIndex !== -1) {
                        return data[fIndex]
                    }
                    return partner
                });

                state.items.sort(sortByDisplayOrder)
                state.status = 'succeeded'
            })
    }
});


/**
 * Partners Async Thunks -- fetch on API
 */
export const fetchPartners = createAsyncThunk("partners/fetchPartners", async (id?: number) => {
    const data = await fetchBackendApi(`partners${id ? `/${id}` : ''}`, {});

    if (!data.success) {
        handleAsyncThunkError(`Erreur de récupération des partenaires : ${data.error}`);
    }

    return { ...data, isSingle: !!id };
})

export const removePartner = createAsyncThunk("partners/deletePartner", async ({ id, notification = true }: { id: number, notification?: boolean }, { dispatch }) => {
    if (!id) {
        handleAsyncThunkError('No ID provided');
    }
    const data = await fetchBackendApi(`partners/${id}`, {
        method: 'DELETE'
    });

    if (!data.success) {
        handleAsyncThunkError(`Failed to delete partner: ${data.error}`);
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

export const setPartner = createAsyncThunk('partners/setPartner', async ({ partner, notification = true }: { partner: PartnerType, notification?: boolean }, { dispatch }) => {
    const { title, url, logo, description, id, display_order } = partner;

    if (!title || !url || !logo || !description || typeof display_order !== 'number') handleAsyncThunkError('champs manquants');

    const isCreateNew = !id;

    const data = await fetchBackendApi(`partners${!isCreateNew ? `/${id}` : ""}`, {
        method: !isCreateNew ? 'PUT' : 'POST',
        body: JSON.stringify(partner)
    });

    if (!data.success) handleAsyncThunkError(`Échec de l'enregistrement du partenaire : ${data.error}`);

    if (notification) {
        toast.success('Félicitations !', {
            description: `Le partenaire ${id ? 'a été modifié avec succès.' : 'a été ajouté avec succès.'}`,
            action: {
                label: 'Annuler',
                onClick: () => {
                    if (!isCreateNew) {
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
    return {
        ...data,
        isCreateNew
    };
})

export const patchParners = createAsyncThunk('partners/patchPartners', async ({ partners, notification = true }: { partners: Partial<PartnerType>[], notification?: boolean }, { dispatch }) => {

    if (!partners.length) handleAsyncThunkError('Aucun partenaire');

    const data = await fetchBackendApi(`partners`, {
        method: 'PATCH',
        body: JSON.stringify(partners)
    });

    if (!data.success) handleAsyncThunkError(`Échec de la mise à jour des partenaires : ${data.error}`);



    if (notification) {
        toast.success('Félicitations !', {
            description: `Les partenaires ont été mis à jour avec succès.`,
            action: {
                label: 'Annuler',
                onClick: () => {
                    data.prevState.forEach((partner: PartnerType) => {
                        dispatch(setPartner({
                            partner,
                            notification: false
                        }))
                    })
                }
            }
        })
    }


    return data;
});

/**
 * Partners selectors
 */
export const selectAllPartners = (state: any) => state.partners.items;
export const selectPartnerById = (state: any, id: number) => state.partners.items.find((item: PartnerType) => item.id === id);
export const selectPartnersStatus = (state: any) => state.partners.status;
export const selectError = (state: any) => state.partners.error;
export const selectResolvedAction = (state: any) => state.partners.resolvedAction;

export { partnersReducer }