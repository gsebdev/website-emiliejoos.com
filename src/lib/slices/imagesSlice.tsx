import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ImageType } from '../definitions';
import { store } from '@/store';
import { handleAsyncThunkError } from '../utils';



/**
 * Image State Definitions
 * 
 * 
 */

export interface ImagesState {
    items: ImageType[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'altPending',
    error: string | null | undefined,
    resolvedAction: string | null | undefined
}

/**
 * 
 * Image Slice
 * 
 * 
 */

export const { reducer: imagesReducer, actions: { setImageResolvedAction, imageAdded, imageUploadFailed, setImageUploadProgress, imageDeleted, imageDeletionFailed, setImageSaving } } = createSlice({
    name: 'images',
    initialState: {
        items: [],
        status: 'idle',
        resolvedAction: null,
        error: null
    } as ImagesState,
    reducers: {
        setImageResolvedAction: (state, action) => {
            state.resolvedAction = action.payload
        },
        imageAdded: (state, action) => {
            state.items.push(action.payload)
        },
        imageUploadFailed: (state, action) => {
            state.items = state.items.filter((item: ImageType) => item.tempId !== action.payload)
        },
        setImageUploadProgress: (state, action) => {
            state.items = state.items.map((item: ImageType) => {
                if (item.tempId === action.payload.tempId) {
                    item.uploadProgress = action.payload.uploadProgress
                }
                return item
            })
        },
        imageDeleted: (state, action) => {
            state.items = state.items.filter((item: ImageType) => item.id !== action.payload)
        },
        imageDeletionFailed: (state, action) => {
            state.items.splice(action.payload.index, 0, action.payload.image)
        },
        setImageSaving: (state, action) => {
           /* state.items = state.items.map((item: ImageType) => {
                if (item.id === action.payload.id) {
                    item.isSaving = action.payload.isSaving
                }
                return item
            })*/
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImages.pending, (state) => {
                state.status = 'loading'

            })
            .addCase(fetchImages.fulfilled, (state, action) => {
                state.items = action.payload.data ?? []
                state.status = 'succeeded'
                state.resolvedAction = 'get'
            })
            .addCase(fetchImages.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la récupération des images.'
            })
            .addCase(removeImage.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setImage.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(setImage.fulfilled, (state, action) => {
                const index = state.items.findIndex(image => image.tempId === action?.payload?.tempId)
                if (index !== -1) {
                    state.items[index] = {
                        ...action?.payload?.data,
                        src: state.items[index].src
                    }
                }
                state.status = 'succeeded'
                state.resolvedAction = 'add'
            })
            .addCase(setImage.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de l\'ajout de l\'image.'
            })
            .addCase(removeImage.fulfilled, (state, action) => {
                const { id } = action.payload.prevState ?? {};
                state.items = state.items.filter(image =>
                    image.id !== id)
                state.status = 'succeeded'
                state.resolvedAction = 'delete'
            })
            .addCase(removeImage.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la suppression de l\'image.'
            })
            .addCase(setImageAlt.fulfilled, (state, action) => {
                const { id, alt } = action.payload.data;
                const image = state.items.find(image => image.id === id);
                if (image) {
                    image.alt = alt;
                    image.isSaving = false;
                    state.status = 'succeeded'
                    state.resolvedAction = 'updateAlt'
                }

            })
            .addCase(setImageAlt.rejected, (state, action) => {
                state.status = 'failed'
                const { error } = action
                state.error = error.message ?? 'Une erreur est survenue lors de la modification du text ALT de l\'image.'
            })
            .addCase(setImageAlt.pending, (state) => {
                state.status = 'altPending'
            })
    }
});


/**
 * 
 * Images Async Thunks -- fetch on Next JS server Actions
 * 
 */

export const fetchImages = createAsyncThunk("images/fetchImages", async () => {

    const response = await fetch(`/api/backend/images`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) handleAsyncThunkError('Failed to fetch images');

    const data = await response.json();

    if (!data.success) handleAsyncThunkError(data.error);

    return data;

})

export const removeImage = createAsyncThunk("images/deleteImage", async (id: number, { dispatch, getState }) => {

    if (!id) handleAsyncThunkError('Image ID is missing');

    const deletedImageIndex = (getState as typeof store.getState)().images.items.findIndex((item: ImageType) => item.id === id);

    if (deletedImageIndex === -1) handleAsyncThunkError('Image not found');

    const deletedImage = { ...(getState as typeof store.getState)().images.items[deletedImageIndex] };

    dispatch(imageDeleted(id));

    const response = await fetch(`/api/backend/images/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        dispatch(imageDeletionFailed({ image: deletedImage, index: deletedImageIndex }));
        handleAsyncThunkError('Failed to delete image');
    }

    const data = await response.json();

    if (!data.success) {
        dispatch(imageDeletionFailed({ image: deletedImage, index: deletedImageIndex }));
        handleAsyncThunkError(data.error);
    }

    return { 
        data,
         prevState: deletedImage 
        };
});

export const setImage = createAsyncThunk('images/setImage', async (imageFile: File, { dispatch }) => {

    if (!imageFile || !(imageFile instanceof File)) handleAsyncThunkError('No image file provided')

    const tempImg = {
        tempId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        src: URL.createObjectURL(imageFile),
        alt: '',
        filename: imageFile.name
    }

    dispatch(imageAdded(tempImg));

    // sending the file to the server

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('enctype', 'multipart/form-data');

    let data = null;

    try {

        const response = await new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    dispatch(setImageUploadProgress({ tempId: tempImg.tempId, uploadProgress: percentComplete }));
                }
            });
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.response);
                }
            };

            xhr.open('POST', '/api/backend/images');
            xhr.send(formData);
        })

        data = JSON.parse(response);

        if (!data.success) {
            throw new Error(data.error);
        }

    } catch (error) {
        dispatch(imageUploadFailed(tempImg.tempId));
        handleAsyncThunkError('Failed to upload image');
    }


    return {
        ...data,
        tempId: tempImg.tempId
    }
})



export const setImageAlt = createAsyncThunk('images/setImageAlt', async ({ id, alt }: { id?: number, alt?: string }) => {

    if (!id || typeof id !== 'number') handleAsyncThunkError('ID Invalide')

    const response = await fetch(`/api/backend/images/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alt })
    });

    if (!response.ok) handleAsyncThunkError('Failed to set image alt')

    const data = await response.json();

    if (!data.success) handleAsyncThunkError(data.error);

    return data;
})



/**
 * 
 * Images selectors
 * 
 */
export const selectAllImages = (state: any): ImageType[] => state.images.items
export const selectImageById = (id: number) => (state: any) => state.images.items.find((item: ImageType) => item.id === id)
export const selectImagesStatus = (state: any) => state.images.status
export const selectImagesError = (state: any) => state.images.error
export const selectImagesResolvedAction = (state: any) => state.images.resolvedAction