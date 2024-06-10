import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { createError } from './app/api/utils';
import { ImageType, PageType, Partner } from './lib/definitions';
import { cookies } from 'next/headers';

function errorHandlerDB(fn: Function, name?: string) {
    return async (...args: any[]) => {
        try {
            return await fn(...args);
        } catch (e) {
            //log the error
            const username = JSON.parse(cookies().get('loggedUser')?.value ?? '{}').username;
            const message = e instanceof Error ? e.message : 'Unknown error';
            logEvent(username, name, null, message, Date.now());

            throw createError("Internal server error", 500);
        }
    };
}
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


/**
 * Logs an event to the database.
 *
 * @param {string | null} username - The username associated with the event.
 * @param {string | null} action - The action performed.
 * @param {string | null} payload - The payload associated with the event.
 * @param {string | null} error - The error message, if any.
 * @param {number} now - The timestamp of the event.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating the success of the operation.
 */
export const logEvent = async (
    username: string | null = null,
    action: string | null = null,
    payload: string | null = null,
    error: string | null = null,
    now: number
): Promise<boolean> => {
    const db = await createConnection();

    try {
        if (!now) {
            throw createError('Timestamp is not provided', 400);
        }

        const [rows] = await db.query<ResultSetHeader>(
            'INSERT INTO `logs` (`username`, `action`, `error`, `timestamp`, `payload`) VALUES (?, ?, ?, ?, ?)',
            [username, action, error, now, payload]
        );

        if (rows.affectedRows === 0) {
            throw createError('Failed to save log event', 500);
        }

        return true;

    } catch (err) {

        console.error(err);

        return false;

    } finally {

        db.end();

    }
};


/**
 * Retrieves a page from the database based on the provided slug. If no slug is provided, all pages are returned.
 *
 * @param {Connection} db - The database connection object.
 * @param {string} [slug] - The slug of the page to retrieve. If not provided, all pages are returned.
 * @return {Promise<RowDataPacket[]>} A promise that resolves to the retrieved page as a RowDataPacket object.
 * @throws {Error} If the page is not found.
 */
export const getPagesFromDB = errorHandlerDB(async (slug?: string): Promise<RowDataPacket[]> => {
    const db = await createConnection();

    try {

        const sql = `SELECT * FROM \`pages\` ${slug ? 'WHERE \`slug\` = ?' : ''}`;
        const [pages] = await db.query<RowDataPacket[]>(sql, [slug]);
        return pages;

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'getPagesFromDB');

export const updatePageInDB = errorHandlerDB(async (page: PageType): Promise<{ updated: PageType, old: PageType }> => {
    const { id, title, slug, images, content, images_number } = page;

    if (!id || !title || !slug || !images || !content || !images_number) {
        throw createError('Missing required fields', 400);
    }

    if (typeof images_number !== 'number' && typeof id !== 'number') {
        throw createError('Bad id or images number type', 400);
    }

    if (!Array.isArray(images)) {
        throw createError('Bad images type', 400);
    }

    const db = await createConnection();

    try {

        const [prevPage] = await db.query<RowDataPacket[]>('SELECT * FROM `pages` WHERE slug=?', [slug]);

        if (!prevPage.length) {
            throw createError('Page: ' + slug + ', not found', 404);
        }

        const [result] = await db.query<ResultSetHeader>('UPDATE `pages` SET title=?, content=?, images_number=?, images=? WHERE slug=?', [title, content, images_number, JSON.stringify(images), slug]);

        if (result.affectedRows === 0) {
            throw createError('Failed to update page: ' + slug, 500);
        }

        return {
            updated: page,
            old: prevPage[0] as PageType
        };

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'updatePageInDB');

/**
 * Retrieves images from the database based on the provided ID. If no ID is provided, all images are returned.
 *
 * @param {number} [id] - The ID of the image to retrieve. If not provided, all images are returned.
 * @return {Promise<RowDataPacket[]>} A promise that resolves to an array of RowDataPacket objects representing the retrieved images.
 * @throws {Error} If no images are found.
 */

export const getImagesFromDB = errorHandlerDB(async (id?: number): Promise<RowDataPacket[]> => {
    const db = await createConnection();

    try {
        const sql = `SELECT * FROM \`images\` ${id ? 'WHERE \`id\` = ?' : ''}`;
        const [images] = await db.query<RowDataPacket[]>(sql, [id]);

        return images;

    } catch (error) {

        throw error;

    } finally {
        db.end();
    }
}, 'getImagesFromDB');

/**
 * Inserts an image into the database with the given filename, height, width, alt text, and source URL.
 *
 * @param {string} filename - The filename of the image.
 * @param {number|undefined} height - The height of the image.
 * @param {number|undefined} width - The width of the image.
 * @param {string} alt - The alt text for the image.
 * @param {string} src - The source URL for the image.
 * @return {Promise<ResultSetHeader>} A promise that resolves to the result of the database query.
 * @throws {Error} If any of the required parameters are missing.
 */
export async function insertImageToDB(
    filename: string,
    height: number | undefined,
    width: number | undefined,
    alt: string,
    src: string
): Promise<ResultSetHeader> {
    const db = await createConnection();

    try {

        if (!filename || !height || !width || !src) {
            throw createError('Missing parameters', 400);
        }

        const sql = 'INSERT INTO `images` (`filename`, `height`, `width`, `alt`, `src`) VALUES (?, ?, ?, ?, ?)';

        const [result] = await db.query<ResultSetHeader>(sql, [filename, height ?? 0, width, alt, src]);

        if (result.affectedRows === 0) {
            throw createError('Failed to insert image', 500);
        }

        return result;

    } catch (error) {

        throw error;

    } finally {

        db.end();

    }
}
/**
 * Deletes an image from the database based on the provided ID.
 *
 * @param {number} id - The ID of the image to be deleted.
 * @return {Promise<ResultSetHeader>} A promise that resolves to the result of the database query.
 * @throws {Error} If the ID parameter is missing or if there was an error deleting the image.
 */
export async function deleteImageFromDB(id: number): Promise<ImageType> {

    if (!id) {
        throw createError('Missing id parameter', 400);
    }

    const db = await createConnection();
    try {
        // Retrieve the image data before deletion
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM `images` WHERE `id` = ?', [id]);

        if (rows.length === 0) {
            throw createError('Image not found', 404);
        }

        const imageData = rows[0] as ImageType;

        // Delete the image
        const [result] = await db.query<ResultSetHeader>('DELETE FROM `images` WHERE `id` = ?', [id]);

        if (result.affectedRows === 0) {
            throw createError('Failed to delete image', 500);
        }

        return imageData;

    } catch (error) {

        throw error;

    } finally {

        db.end();

    }
}

/**
 * Updates the alt text of an image in the database.
 *
 * @param {number} id - The ID of the image.
 * @param {string} newAlt - The new alt text.
 * @return {Promise<{ updated: ImageType, old: ImageType }>} A promise that resolves to an object containing the updated and old image data.
 * @throws {Error} If any of the required parameters are missing, if the alt text is not a string, or if the ID is not a number.
 * @throws {Error} If the image is not found in the database.
 * @throws {Error} If the update of the alt text fails.
 */
export const updateImageAlt = errorHandlerDB(async (id: number, newAlt: string): Promise<{ updated: ImageType, old: ImageType }> => {

    if (!id || typeof newAlt !== 'string') {
        throw createError('Missing parameters', 400);
    }

    if (typeof newAlt !== 'string') {
        throw createError('Invalid alt text', 400);
    }

    if (typeof id !== 'number') {
        throw createError('Invalid id', 400);
    }

    const db = await createConnection();

    try {
        // Retrieve the image data before updating
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM `images` WHERE `id` = ?', [id]);

        if (rows.length === 0) {
            throw createError('Image not found', 404);
        }

        const imageData = rows[0] as ImageType;

        // Update the alt text
        const [updateResult] = await db.query<ResultSetHeader>(
            'UPDATE `images` SET `alt` = ? WHERE `id` = ?',
            [newAlt, id]
        );

        // Verify the update
        if (updateResult.affectedRows === 0) {
            throw createError('Failed to update image', 500);
        }

        return {
            updated: {
                ...imageData,
                alt: newAlt
            },
            old: imageData
        };

    } catch (error) {

        throw error;

    } finally {

        db.end();

    }
}, 'updateImageAlt');
/**
 * Retrieves logs from the database.
 *
 * @return {Promise<RowDataPacket[]>} A promise that resolves to the retrieved logs as an array of RowDataPacket objects.
 */
export async function getLogsFromDB(): Promise<RowDataPacket[]> {
    const db = await createConnection();
    const sql = 'SELECT * FROM `logs` ORDER BY timestamp DESC';

    try {
        const [logs] = await db.query<RowDataPacket[]>(sql);

        if (!logs.length) {
            throw createError('No logs found', 404);
        }

        return logs;

    } catch (error) {

        throw error;

    } finally {

        db.end();
    }
}

/**
 * Retrieves partners from the database based on the provided ID and display order revalidation flag.
 *
 * @param {number | null} id - The ID of the partner to retrieve. If not provided, all partners are retrieved.
 * @param {boolean} revalidateDisplayOrder - Flag indicating whether to revalidate the display order of the partners.
 * @return {Promise<RowDataPacket[]>} A promise that resolves to an array of partners.
 * @throws {Error} If the ID is not a number or if no partners are found.
 */
export async function getPartnersFromDB(id?: number | null, revalidateDisplayOrder?: boolean): Promise<RowDataPacket[]> {
    const db = await createConnection();

    try {

        if (id && typeof id !== 'number') {
            throw createError('le format de l\'ID est invalide', 400);
        }

        let [partners] = await db.query<RowDataPacket[]>(`SELECT * FROM \`partners\` ${id ? 'WHERE id=?' : 'ORDER BY display_order ASC'}`, [id]);

        if (!partners.length) {
            throw createError('Aucun partenaire n\'a été trouvé', 404);
        }

        if (revalidateDisplayOrder) {

            partners = partners.map((p, i) => {
                if (p.display_order !== i) {
                    db.query<ResultSetHeader>('UPDATE `partners` SET display_order=? WHERE id=?', [i, p.id]);
                    return { ...p, display_order: i };
                }
                return p;
            });

        }

        return partners;

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }

}

/**
 * Deletes a partner from the database based on the provided ID.
 *
 * @param {number} id - The ID of the partner to be deleted.
 * @return {Promise<Partner>} A promise that resolves to the deleted partner.
 * @throws {Error} If the ID is invalid or if the partner is not found.
 * @throws {Error} If the partner cannot be deleted.
 */
export async function deletePartnerFromDB(id: number): Promise<Partner> {

    if (!id || typeof id !== 'number') {
        throw createError('Invalid id', 400);
    }

    const db = await createConnection();

    try {
        const [partner] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` WHERE id=?', [id]);

        if (!partner.length) {
            throw createError('Partner not found', 404);
        }

        const [result] = await db.query<ResultSetHeader>('DELETE FROM `partners` WHERE id=?', [id]);

        if (result.affectedRows === 0) {
            throw createError('Failed to delete partner', 500);
        }

        return partner[0] as Partner;

    } catch (e) {

        throw e

    } finally {

        db.end();
    }

}

/**
 * Inserts a partner into the database.
 *
 * @param {Partner} partner - The partner object to be inserted.
 * @return {Promise<ResultSetHeader>} A promise that resolves to the result of the insert operation.
 * @throws {Error} If any of the required fields are missing or if there is an error inserting the partner.
 */
export const insertPartnerToDB = errorHandlerDB(async (partner: Partial<Partner>): Promise<ResultSetHeader> => {

    const { title, url, logo, description } = partner;

    if (!title || !url || !logo || !description) {
        throw createError('Missing required fields', 400);
    }

    const db = await createConnection();

    try {
        const [rows] = await db.query<RowDataPacket[]>('SELECT MAX(`display_order`) as max_display_order FROM `partners`');
        
        let display_order = 0;
        
        if (rows.length === 1 || typeof rows[0].max_display_order === 'number') {
            display_order = rows[0].max_display_order + 1;
        }

        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO `partners` (`logo`, `title`, `url`, `description`, `display_order`) VALUES (?, ?, ?, ?, ?)',
            [JSON.stringify(logo), title, url, description, display_order]
        );

        if (result.affectedRows === 0) {
            throw createError('Failed to insert partner', 500);
        }

        return result;


    } catch (e) {

        throw e;

    } finally {

        db.end();

    }

}, 'insertPartnerToDB');

/**
 * Updates a partner in the database with the provided partner object.
 *
 * @param {Partner} partner - The partner object containing the updated partner details.
 * @return {Promise<{ updated: Partner, old: Partner }>} A promise that resolves to an object containing the updated partner and the previous partner.
 * @throws {Error} If any of the required fields are missing or if the partner is not found or if there is an error updating the partner.
 */

export const updatePartnerInDB = errorHandlerDB(async (partner: Partner): Promise<{ updated: Partner, old: Partner }> => {
    const { title, url, logo, description, id, display_order } = partner;

    if (!id || !title || !url || !logo || !description || typeof display_order !== 'number') {
        throw createError('Missing required fields', 400);
    }

    const db = await createConnection();

    try {

        const [prevPartner] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` WHERE id=?', [id]);

        if (!prevPartner.length) {
            throw createError('Partner not found', 404);
        }

        const [result] = await db.query<ResultSetHeader>('UPDATE `partners` SET `logo`=?, `title`=?, `url`=?, `description`=?, `display_order`=? WHERE id=?', [JSON.stringify(logo), title, url, description, display_order, id]);

        if (result.affectedRows === 0) {
            throw createError('Failed to update partner', 500);
        }

        return {
            updated: partner,
            old: prevPartner[0] as Partner
        };

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'updatePartnerInDB');

/**
 * Retrieves a user from the database based on the provided username.
 *
 * @param {string} username - The username of the user to retrieve.
 * @return {Promise<RowDataPacket[]>} A promise that resolves to an array of RowDataPacket objects representing the user(s) matching the provided username.
 * @throws {Error} If there are too many failed login attempts within the last 24 hours for the given username.
 */
export async function getUserFromDB(username: string): Promise<RowDataPacket[]> {
    const dayAgo = Date.now() - (60 * 60 * 24 * 1000);
    const db = await createConnection();

    try {
        const [logs] = await db.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM logs WHERE action="login" AND error IS NOT NULL AND username=? AND timestamp > ?', [username, dayAgo]);

        if (logs[0].count > 5) {
            throw createError('Too many failed login attempts', 429);
        }

        const [users] = await db.query<RowDataPacket[]>('SELECT * FROM `users` WHERE username=?', [username]);

        return users;

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}

