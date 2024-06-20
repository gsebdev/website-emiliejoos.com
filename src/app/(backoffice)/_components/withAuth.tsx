import { getAuth, selectAuthenticated, selectUser } from "@/app/(backoffice)/_lib/slices/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "@/app/_components/ui/loader";
import { AppDispatch } from "../_lib/store";

export default function withAuth(ProtectedComponent: React.ComponentType<any>) {

    const WithAuth = (props: React.ComponentProps<any>) => {

        const router = useRouter();
        const path = usePathname();
        const dispatch = useDispatch<AppDispatch>();

        const user = useSelector(selectUser);
        const authentication = useSelector(selectAuthenticated);

        useEffect(() => {
            const checkAuth = async () => {

                if (authentication === null) {
                    dispatch(getAuth());
                }

                else if (authentication === 'failed') {
                    router.replace('/login');
                }
            }

            checkAuth();

        }, [authentication, path, dispatch, router]);

        if (authentication === 'pending') {
            return (
                <div className="flex items-center justify-center h-screnn w-full"><Loader /></div>
            )
        }
        
        if (authentication === 'success' && user) {

            return <ProtectedComponent {...props} />

        }

        return null;

    }

    WithAuth.displayName = 'WithAuth';

    return WithAuth
}