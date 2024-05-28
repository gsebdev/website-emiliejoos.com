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
