import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ImageType } from '../definitions';
import { store } from '@/store';



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

export const { reducer: imagesReducer, actions: { setImageResolvedAction, imageAdded, imageUploadFailed, setImageUploadProgress, imageDeleted, imageDeletionFailed } } = createSlice({
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
                state.error = action.error?.message
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
                state.error = action.payload && typeof action.payload === 'string' ? action.payload : action.error?.message
                state.resolvedAction = 'add'
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
                state.error =action.payload && typeof action.payload === 'string' ? action.payload : action.error?.message
            })
            .addCase(setImageAlt.fulfilled, (state, action) => {
                if (!action?.payload?.success) {
                    state.status = 'failed'
                    state.error = action?.payload?.error
                    return;
                }
                const { id, alt } = action.payload.data;
                state.items = state.items.map(image =>
                    image.id === id ? { ...image, alt } : image)
                state.status = 'succeeded'
                state.resolvedAction = 'updateAlt'
            })
            .addCase(setImageAlt.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error?.message
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

        if (!response.ok) {
            throw new Error(`Failed to fetch images: ${response.status}`);
        }

        return await response.json();
})

export const removeImage = createAsyncThunk("images/deleteImage", async (id: number, { rejectWithValue, dispatch, getState }) => {

    if (!id) {
        return rejectWithValue(new Error('No ID provided'));
    }
    const deletedImageIndex = (getState as typeof store.getState)().images.items.findIndex((item: ImageType) => item.id === id);

    if (deletedImageIndex === -1) {
        return rejectWithValue(new Error('Image not found'));
    }
    const deletedImage = { ...(getState as typeof store.getState)().images.items[deletedImageIndex]};

    dispatch(imageDeleted(id));

    try {
        const response = await fetch(`/api/backend/images/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error);
        }
        return { data, prevState: deletedImage };

    } catch (error) {

        dispatch(imageDeletionFailed({image: deletedImage, index: deletedImageIndex}));

        return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }



})

export const setImage = createAsyncThunk('images/setImage', async (imageFile: File, { rejectWithValue, dispatch }) => {

    if (!imageFile || !(imageFile instanceof File)) {
        return rejectWithValue('No file provided')
    }

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
        });
        const data = JSON.parse(response);

        if (!data.success) {
            throw new Error(data.error);
        }
        return {
            ...data,
            tempId: tempImg.tempId
        }
    } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        dispatch(imageUploadFailed(tempImg.tempId));
        return rejectWithValue(errorMsg)
    }
})



export const setImageAlt = createAsyncThunk('images/setImageAlt', async ({ id, alt }: { id?: number, alt?: string }, { rejectWithValue }) => {
    if (!id || typeof id !== 'number') return rejectWithValue(new Error('Invalid ID'))

    const response = await fetch(`/api/backend/images/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alt })
    });
    return await response.json()
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