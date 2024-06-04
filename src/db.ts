import { timeStamp } from 'console';
import mysql from 'mysql2/promise';

export const createConnection = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST as string,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    return connection;
};

export const logEvent = async (username: string | null = null, action: string | null = null, payload: null | string = null, error: null | string = null, now: number) => {
    if (!now) throw new Error('timestamp is not defined');
    const connection = await createConnection();
    try {
        const result = await connection.query('INSERT INTO `logs` (`username`, `action`, `error`, `timestamp`, `payload`) VALUES (?, ?, ?, ?, ?)', [username, action, error, now, payload]);
        return result;
    } catch (error: Error | any) {
        console.error(error);
        return false;
    }
};