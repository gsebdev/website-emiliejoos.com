import { createSlice } from '@reduxjs/toolkit';
import { UserType } from '@/auth';
import Cookies from 'js-cookie';


/**
 * State Definition
 * 
 */

export interface UserState {
    user: UserType | null,
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
 * User Slice
 * 
 * 
 */

export const { reducer: userReducer, actions: {
    getLoggedInUser,
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
        user: null,
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
        getLoggedInUser: (state) => {
            const userCookie = Cookies.get('loggedUser');
            if (userCookie) {
                state.user = JSON.parse(userCookie);
            }
        },
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
 * Partners selectors
 * 
 */
export const selectUser = (state: any) => state.user.user
export const selectGalleryOpen = (state: any) => state.user.galleryOpen
export const selectSelectedImagesIndex = (state: any) => state.user.selectedImagesIndex
export const selectPartnerDialog = (state: any) => state.user.partnerDialogOpen