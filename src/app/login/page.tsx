
"use client"
import { login } from "../../lib/actions";

import Image from 'next/image';
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

const FormSchema = z.object({
    username: z.string().min(5, {
        message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(2, {
        message: "mauvais password.",
    })
})

export default function Home() {

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

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
                        <form action={login} className="space-y-6 p-4">
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


                            <Button type="submit" className="w-full">S&apos;identifier</Button>
                        </form>
                    </Form>
                </div>
            </main>
        </>
    );
}
