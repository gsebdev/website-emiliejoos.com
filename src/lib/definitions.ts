export type Partner = {
    title: string
    url: string
    logo: string    
    description: string
    id: number
    display_order: number
}

export type UserType = {
    firstname: string,
    lastname: string,
    username: string,
    id: number,
    token: string
}

export type ImageType = {
    tempId?: string
    id?: number,
    src: string,
    height?: number,
    width?: number,
    alt?: string,
    filename: string,
    placeholderUrl?: string,
    uploadProgress?: number
}