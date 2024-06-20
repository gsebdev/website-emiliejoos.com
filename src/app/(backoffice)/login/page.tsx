
"use client"

import Image from 'next/image';
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/app/_components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/_components/ui/form"

import { Input } from "@/app/_components/ui/input"
import { FormEvent, useState } from 'react';
import Loader from '@/app/_components/ui/loader';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '../_lib/api';
import { loginFormSchema } from '@/app/_lib/form-shemas';

export default function Home() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const searchParams = useSearchParams();

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const handleSubmitForm = (e: FormEvent) => {
        
        e.preventDefault();

        if (loading) return;

        const sendLogin = async () => {

            setLoading(true);
            setError(null);

            const data = form.getValues();

            const loginResponseData = await fetchApi('login', {
                method: 'POST',
                body: JSON.stringify(data)
            })


            if (!loginResponseData.success) {

                setError(loginResponseData.error);
                setLoading(false);
                return;
            }

            const redirect = searchParams.get('redirect');

            if(redirect) {

                location.href = new URL(redirect, process.env.BASE_URL).href;

            } else {

                location.href = '/backend';
                        
            }

            setLoading(false);
        }

        sendLogin();
    }

    return (
        <>
            <header className="container h-[100px] flex justify-between items-center px-8">
                <Image src="/logo/logo-h-black.webp" alt="logo" width={256} height={80} className="h-[80px]" />
                <nav>
                    <ul className="flex gap-x-4 h-full items-center">
                        <li><Link href="/">Accueil</Link></li>
                        <li><Link className="active" href="/login">Connexion</Link></li>
                    </ul>
                </nav>
            </header>
            <main>

                <div className="container flex flex-col justify-center h-screen text-center max-w-2xl">
                    <h1>Identifiez-vous</h1>
                    <p className="text-sm">{'Entrez votre nom d\'utilisateur et votre mot de passe'}</p>
                    <Form {...form}>
                        <form className="space-y-6 p-4" onSubmit={handleSubmitForm}>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="text-left">
                                        <FormLabel>Utilisateur</FormLabel>
                                        <FormControl>
                                            <Input placeholder="dupond123..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="text-left">
                                        <FormLabel>Mot de passe</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <Button type="submit" className="w-full">{loading ? <Loader /> : 'S\'identifier'}</Button>
                            {!!error &&
                                <p className="text-xs text-red-500">{error}</p>
                            }
                        </form>
                    </Form>
                </div>
            </main>
        </>
    );
}
