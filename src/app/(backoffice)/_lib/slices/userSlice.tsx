import { createSlice } from '@reduxjs/toolkit';


/**
 * State Definition
 * 
 */

export interface UserState {
    galleryOpen: boolean,
    selectedImagesIndex: number[],
    partnerDialogOpen: {
        editing: boolean,
        partner: number | null,
        open: boolean
    }
}

/**
 * 
 * Slice
 * 
 * 
 */


export const { reducer: userReducer, actions: {
    openGallery,
    setSelectedImagesIndex,
    setPartnerDialogOpen,
    setEditedPartner,
    setViewedPartner,
    removeSelectedImages,
    addSelectedImages
} } = createSlice({
    
    name: 'user',

    initialState: {
        galleryOpen: false,
        selectedImagesIndex: [],
        partnerDialogOpen: {
            editing: false,
            open: false,
            partner: null
        }
    } as UserState
    ,
    reducers: {
        openGallery: (state, action) => {
            state.galleryOpen = action.payload
        },
        setSelectedImagesIndex: (state, action) => {
            if (Array.isArray(action.payload) && action.payload.every(item => typeof item === 'number')) {
                state.selectedImagesIndex = action.payload
            }
        },
        addSelectedImages: (state, action) => {
            if (Array.isArray(action.payload) && action.payload.every(item => typeof item === 'number')) {
                state.selectedImagesIndex.push(...action.payload)
            }
        },
        removeSelectedImages: (state, action) => {
            if (Array.isArray(action.payload) && action.payload.every(item => typeof item === 'number')) {
                state.selectedImagesIndex = state.selectedImagesIndex.filter((ids) => !action.payload.includes(ids))
            }
        },
        setPartnerDialogOpen: (state, action) => {
            state.partnerDialogOpen = {
                editing: action.payload ? true : false,
                open: action.payload ? true : false,
                partner: action.payload ? state.partnerDialogOpen.partner : null
            }
        },
        setEditedPartner: (state, action) => {
            state.partnerDialogOpen.open = true;
            state.partnerDialogOpen.editing = true;
            state.partnerDialogOpen.partner = action.payload;
        },
        setViewedPartner: (state, action) => {
            state.partnerDialogOpen.editing = false;
            state.partnerDialogOpen.open = true;
            state.partnerDialogOpen.partner = action.payload;
        }
    }
});


/**
 * 
 * selectors
 * 
 */

export const selectGalleryOpen = (state: any) => state.user.galleryOpen
export const selectSelectedImagesIndex = (state: any) => state.user.selectedImagesIndex
export const selectPartnerDialog = (state: any) => state.user.partnerDialogOpen