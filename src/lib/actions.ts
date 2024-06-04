'use server'
import { cookies } from 'next/headers'
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { createConnection, logEvent } from "../db";
import { generateJwt, verifyJwt } from '@/auth';
import { redirect } from 'next/navigation';

const isLoggedIn = async () => {
    const cookieData = JSON.parse(cookies().get('loggedUser')?.value ?? '{}');
    const token = cookieData.token;
    return await verifyJwt(token);
}

export const savePartner = async (title: string, url: string, logo: string, description: string, display_order: number, id: number | null = null) => {
    if (!await isLoggedIn()) throw new Error('Unauthorized', { cause: 401 });

    const db = await createConnection();
    try {
        if (!title || !url || !logo || !description || typeof display_order !== 'number') {
            db.end();
            return { success: false, error: 'champs manquants' };
        }

        if (id) {
            const [prevPartner] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` WHERE id=?', [id]);
            if (!prevPartner?.[0]) {
                await db.query<ResultSetHeader>('INSERT INTO `partners` (`id`, `logo`, `title`, `url`, `description`, `display_order`) VALUES (?, ?, ?, ?, ?, ?)', [id, logo, title, url, description, display_order]);
            } else {
                await db.query<ResultSetHeader>('UPDATE `partners` SET `logo`=?, `title`=?, `url`=?, `description`=?, `display_order`=? WHERE id=?', [logo, title, url, description, display_order, id]);
            }
            db.end();
            return {
                success: true,
                data: {
                    id,
                    title,
                    url,
                    logo,
                    description,
                    display_order
                },
                prevState: prevPartner[0] ? {
                    id: prevPartner[0]?.id,
                    title: prevPartner[0]?.title,
                    url: prevPartner[0]?.url,
                    logo: prevPartner[0]?.logo,
                    description: prevPartner[0]?.description,
                    display_order: prevPartner[0]?.display_order
                } : null
            };
        }

        // if no id is provided, create a new partner

        //check if title doesn't already exists
        const [result] = await db.query('SELECT COUNT(*) as count FROM partners WHERE title=?', [title]) as any;
        if (result?.[0]?.count && result[0].count > 0) {
            throw new Error('Un partenaire avec ce nom existe déjà');
        }

        //insert partner
        const [partner] = await db.query<ResultSetHeader>('INSERT INTO `partners` (`logo`, `title`, `url`, `description`, `display_order`) VALUES (?, ?, ?, ?, ?)', [logo, title, url, description, display_order]);
        db.end();
        return {
            success: true,
            data: {
                id: partner.insertId,
                title,
                url,
                logo,
                description,
                display_order
            },
            prevState: null
        }

    } catch (error: Error | any) {
        db.end();
        return {
            success: false,
            error: error?.message
        };
    }
}
export const deletePartner = async (id: number) => {
    if (!await isLoggedIn()) throw new Error('Unauthorized');
    const db = await createConnection();
    try {
        if (!id || typeof id !== 'number') {
            return { success: false, error: 'le format de l\'ID est invalide' };
        }
        const [partner] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` WHERE id=?', [id]);
        if (!partner[0]) {
            return { success: false, error: 'Ce partenaire n\'existe pas' };
        }

        await db.query<ResultSetHeader>('DELETE FROM `partners` WHERE id=?', [id]);
        db.end();
        return {
            success: true,
            prevState: {
                title: partner[0]?.title,
                url: partner[0]?.url,
                logo: partner[0]?.logo,
                description: partner[0]?.description,
                id: partner[0]?.id,
                display_order: partner[0]?.display_order
            }
        };
    } catch (error: Error | any) {
        db.end();
        return {
            success: false,
            error: error?.message
        };
    }
}

export const getPartners = async (id: number | null = null) => {
    if (!await isLoggedIn()) throw new Error('Unauthorized');
    const db = await createConnection();
    try {
        if (id) {
            if (typeof id !== 'number') {
                return { success: false, error: 'le format de l\'ID est invalide' };
            }
            const [partner] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` WHERE id=?', [id]);
            return {
                success: true,
                data: partner[0]
            };
        }
        const [partners] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` ORDER BY display_order ASC');

        const partnersDisplayOrder = partners.map((p, i) => {
            if (p.display_order !== i) {
                db.query<ResultSetHeader>('UPDATE `partners` SET display_order=? WHERE id=?', [i, p.id]);
                return { ...p, display_order: i };
            }
            return p;
        });
        db.end();
        return {
            success: true,
            data: partnersDisplayOrder
        };
    } catch (error: Error | any) {
        db.end();
        return {
            success: false,
            error: error?.message
        };
    }
    
}

export const login = async (value: FormData) => {
    const username = value.get('username') as string;
    const password = value.get('password') as string;

    if (!username || !password) {
        return { success: false, error: 'Missing fields' };
    }
    const db = await createConnection();
    const now = Date.now();
    try {
        const dayAgo = now - 60 * 60 * 24;
        const [logs] = await db.query('SELECT COUNT(*) as count FROM logs WHERE action="login" AND error IS NOT NULL AND username=? AND timestamp > ?', [username, dayAgo]) as any;
        if (logs?.[0]?.count && logs[0].count > 5) {
            throw new Error('Too many unsuccessful login attempts. Please try again later.');
        }
        const [result] = await db.query('SELECT * FROM `users` WHERE username=? AND password=?', [username, password]) as any;
        if (!result?.[0]) {
            throw new Error('Wrong username or password');
        }

        const token = await generateJwt({
            id: result[0].id,
            username,
            firstname: result[0].firstname,
            lastname: result[0].lastname
        }, '7d');

        const cookieData = JSON.stringify({
            token: token,
            firstname: result[0].firstname,
            lastname: result[0].lastname,
            username: username,
            id: result[0].id
        })

        cookies().set('loggedUser', cookieData, {
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        await logEvent(username, 'login', null, null, now);

    } catch (error: Error | any) {
        await logEvent(username, 'login', null, error?.message, now);
        return { success: false, error: error?.message };
    }

    redirect('/backend');
}