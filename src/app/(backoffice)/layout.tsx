import type { Metadata } from "next";
import StoreProvider from './_components/storeProvider';
import { Auth } from '../_lib/auth';

import './backoffice.css';

export const metadata: Metadata = {
    title: "Emilie Joos - Panneau d'administration",
    description: "By Sebastien Gault",
};

export default async function BackofficeLayout({ children }: Readonly<{
    children: React.ReactNode;
    params: string
}>) {

    const { currentUser, isLoggedIn } = Auth.getSession();

    return (
        <html lang="fr">
            <body>
                <StoreProvider
                    preloadedState={{
                        auth: {
                            user: currentUser,
                            authenticated: isLoggedIn && currentUser ? 'success' : null
                        }
                    }}
                >
                    {children}
                </StoreProvider>
            </body>
        </html>
    )
}