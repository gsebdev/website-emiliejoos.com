import cookies from 'js-cookie';
import { signUserOut } from './slices/authSlice';
import { AppDispatch, store } from './store';

interface fetchApiInterface {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    body?: string | FormData
    headers?: Record<string, string>
}

export const fetchApi = async (ressource: string, {
    method,
    body,
    headers
}: fetchApiInterface) => {

    if (!method) method = 'GET';

    const csrfHeader = { 'X-CSRF-Token': cookies.get('csrfToken') || '' };

    try {

        const response = await fetch(`/api/${ressource}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...csrfHeader,
                ...headers
            },
            body
        });

        if (response.status === 401) {
            
            const dispatch: AppDispatch|undefined = store?.dispatch;
            
            if(dispatch) dispatch(signUserOut());

        } else {

            return await response.json();

        }
    } catch (e) {

        return {

            success: false,
            error: "Erreur de serveur. Veuillez reessayer plus tard."
            
        }
    }


}

export const fetchBackendApi = async (ressource: string, {
    method,
    body,
    headers
}: fetchApiInterface) => {
    return await fetchApi(`backend/${ressource}`, {
        method,
        body,
        headers
    });
}