export type PartnerType = {
    title: string
    url: string
    logo: {
        id?: number
        url?: string
    }
    description: string
    id: number
    display_order: number
}

export type UserType = {
    firstname: string,
    lastname: string,
    username: string,
    id: number,
    email: string,
}

export type ImageType = {
    tempId?: string
    id?: number,
    src: string,
    height?: number,
    width?: number,
    alt?: string,
    filename: string,
    blur_data_image?: string,
    placeholderUrl?: string,
    uploadProgress?: number,
    isSaving?: boolean
}

export type PageType = {
    id: number,
    slug: string,
    title: string,
    content: string,
    images_number: number,
    images: number[],
}

export type SettingType = {
    id: number,
    name: string,
    value: string
}

export type TestimonialType = {
    id: string,
    image: number
}

export interface PagesConfigInterface {
    [key: string]: {
        title: string;
        images_number: number;
    };
}

export interface ErrorResponse {
    success: false;
    error: string;
}