import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Auth } from './auth';
import { ImageType, PageType, PartnerType, PostType, SettingType } from '../_types/definitions';
import { createResponseError, getBlurDataImage, slugify } from './utils';


export function errorHandlerDB(fn: Function, name?: string) {
    return async (...args: any[]) => {
        try {
            return await fn(...args);
        } catch (e: any) {

            if (e?.status && typeof e.status === 'number') {

                throw e;

            } else {

                //log the error
                const { currentUser: { username } } = Auth.getSession();

                const message = e instanceof Error ? e.message : 'Unknown error';

                await logEvent(username, name, null, message);

                throw createResponseError("Internal server error", 500);
            }
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
    error: string | null = null
): Promise<boolean> => {
    const db = await createConnection();

    try {

        const [rows] = await db.query<ResultSetHeader>(
            'INSERT INTO `logs` (`username`, `action`, `error`, `payload`) VALUES (?, ?, ?, ?)',
            [username, action, error, payload]
        );

        if (rows.affectedRows === 0) {
            throw createResponseError('Failed to save log event', 500);
        }

        return true;

    } catch (err) {

        console.error(err);

        return false;

    } finally {

        db.end();

    }
};


export const countMissedLoginAttemps = errorHandlerDB(async (username: string, duration: number) => {
    const db = await createConnection();
    try {

        if (!username) throw createResponseError('Error', 500);

        const [logs] = await db.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM logs WHERE action="login" AND error IS NOT NULL AND username=? AND timestamp > ?', [username, duration]);

        return logs[0];

    } catch (error) {

        throw error

    } finally {
        db.end();
    }



}, 'countMissedLoginAttemps');

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
        throw createResponseError('Missing required fields', 400);
    }

    if (typeof images_number !== 'number' && typeof id !== 'number') {
        throw createResponseError('Bad id or images number type', 400);
    }

    if (!Array.isArray(images)) {
        throw createResponseError('Bad images type', 400);
    }

    const db = await createConnection();

    try {

        const [prevPage] = await db.query<RowDataPacket[]>('SELECT * FROM `pages` WHERE slug=?', [slug]);

        if (!prevPage.length) {
            throw createResponseError('Page: ' + slug + ', not found', 404);
        }

        const [result] = await db.query<ResultSetHeader>('UPDATE `pages` SET title=?, content=?, images_number=?, images=? WHERE slug=?', [title, content, images_number, JSON.stringify(images), slug]);

        if (result.affectedRows === 0) {
            throw createResponseError('Failed to update page: ' + slug, 500);
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
            throw createResponseError('Missing parameters', 400);
        }

        const blurDataURL = await getBlurDataImage(src);

        const sql = 'INSERT INTO `images` (`filename`, `height`, `width`, `alt`, `src`, blur_data_image) VALUES (?, ?, ?, ?, ?, ?)';

        const [result] = await db.query<ResultSetHeader>(sql, [filename, height ?? 0, width, alt, src, blurDataURL]);

        if (result.affectedRows === 0) {
            throw createResponseError('Failed to insert image', 500);
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
        throw createResponseError('Missing id parameter', 400);
    }

    const db = await createConnection();
    try {
        // Retrieve the image data before deletion
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM `images` WHERE `id` = ?', [id]);

        if (rows.length === 0) {
            throw createResponseError('Image not found', 404);
        }

        const imageData = rows[0] as ImageType;

        // Delete the image
        const [result] = await db.query<ResultSetHeader>('DELETE FROM `images` WHERE `id` = ?', [id]);

        if (result.affectedRows === 0) {
            throw createResponseError('Failed to delete image', 500);
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
        throw createResponseError('Missing parameters', 400);
    }

    if (typeof newAlt !== 'string') {
        throw createResponseError('Invalid alt text', 400);
    }

    if (typeof id !== 'number') {
        throw createResponseError('Invalid id', 400);
    }

    const db = await createConnection();

    try {
        // Retrieve the image data before updating
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM `images` WHERE `id` = ?', [id]);

        if (rows.length === 0) {
            throw createResponseError('Image not found', 404);
        }

        const imageData = rows[0] as ImageType;

        // Update the alt text
        const [updateResult] = await db.query<ResultSetHeader>(
            'UPDATE `images` SET `alt` = ? WHERE `id` = ?',
            [newAlt, id]
        );

        // Verify the update
        if (updateResult.affectedRows === 0) {
            throw createResponseError('Failed to update image', 500);
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
            throw createResponseError('No logs found', 404);
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
            throw createResponseError('le format de l\'ID est invalide', 400);
        }

        let [partners] = await db.query<RowDataPacket[]>(`SELECT * FROM \`partners\` ${id ? 'WHERE id=?' : 'ORDER BY display_order ASC'}`, [id]);

        if (!partners.length) {
            throw createResponseError('Aucun partenaire n\'a été trouvé', 404);
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
 * @return {Promise<PartnerType>} A promise that resolves to the deleted partner.
 * @throws {Error} If the ID is invalid or if the partner is not found.
 * @throws {Error} If the partner cannot be deleted.
 */
export async function deletePartnerFromDB(id: number): Promise<PartnerType> {

    if (!id || typeof id !== 'number') {
        throw createResponseError('Invalid id', 400);
    }

    const db = await createConnection();

    try {
        const [partner] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` WHERE id=?', [id]);

        if (!partner.length) {
            throw createResponseError('PartnerType not found', 404);
        }

        const [result] = await db.query<ResultSetHeader>('DELETE FROM `partners` WHERE id=?', [id]);

        if (result.affectedRows === 0) {
            throw createResponseError('Failed to delete partner', 500);
        }

        return partner[0] as PartnerType;

    } catch (e) {

        throw e

    } finally {

        db.end();
    }

}

/**
 * Inserts a partner into the database.
 *
 * @param {PartnerType} partner - The partner object to be inserted.
 * @return {Promise<ResultSetHeader>} A promise that resolves to the result of the insert operation.
 * @throws {Error} If any of the required fields are missing or if there is an error inserting the partner.
 */
export const insertPartnerToDB = errorHandlerDB(async (partner: Partial<PartnerType>): Promise<ResultSetHeader> => {

    const { title, url, logo, description } = partner;

    if (!title || !url || !logo || !description) {
        throw createResponseError('Missing required fields', 400);
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
            throw createResponseError('Failed to insert partner', 500);
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
 * @param {PartnerType} partner - The partner object containing the updated partner details.
 * @return {Promise<{ updated: PartnerType, old: PartnerType }>} A promise that resolves to an object containing the updated partner and the previous partner.
 * @throws {Error} If any of the required fields are missing or if the partner is not found or if there is an error updating the partner.
 */

export const updatePartnerInDB = errorHandlerDB(async (partner: Partial<PartnerType>): Promise<{ updated: PartnerType, old: PartnerType }> => {

    if (!partner.id) {
        throw createResponseError('Missing required fields', 400);
    }

    const db = await createConnection();

    try {

        const [prevPartner] = await db.query<RowDataPacket[]>('SELECT * FROM `partners` WHERE id=?', [partner.id]);

        if (!prevPartner.length) {
            throw createResponseError('Partner not found', 404);
        }

        const updatedPartner = { ...prevPartner[0], ...partner };

        const { title, url, logo, description, id, display_order } = updatedPartner;

        const [result] = await db.query<ResultSetHeader>('UPDATE `partners` SET `logo`=?, `title`=?, `url`=?, `description`=?, `display_order`=? WHERE id=?', [JSON.stringify(logo), title, url, description, display_order, id]);

        if (result.affectedRows === 0) {
            throw createResponseError('Failed to update partner', 500);
        }

        return {
            updated: updatedPartner as PartnerType,
            old: prevPartner[0] as PartnerType
        };

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'updatePartnerInDB');

/**
 * Updates a post in the database with the provided post object.
 *
 * @param {PostType} post - The post object containing the updated post details.
 * @return {Promise<{ updated: PostType, old: PostType }>} A promise that resolves to an object containing the updated post and the previous post.
 * @throws {Error} If any of the required fields are missing or if the post is not found or if there is an error updating the post.
 */
export const updatePostInDB = errorHandlerDB(async (post: Partial<PostType>): Promise<{ updated: PostType, old: PostType }> => {

    if (!post.id || Object.keys(post).length < 2) {
        throw createResponseError('Missing required fields', 400);
    }

    const db = await createConnection();

    try {

        const [prevPost] = await db.query<RowDataPacket[]>('SELECT * FROM `posts` WHERE id=?', [post.id]);

        if (!prevPost.length) {
            throw createResponseError('Post not found', 404);
        }

        const updatedPost = { ...prevPost[0], ...post };

        updatedPost.updated_at = new Date();

        const { title, slug, cover, excerpt, id, display_order, content, created_at, updated_at } = updatedPost;

        const [result] = await db.query<ResultSetHeader>(
            'UPDATE `posts` SET `title`=?, `slug`=?, `cover`=?, `excerpt`=?, `display_order`=?, `content`=?, `created_at`=?, `updated_at`=? WHERE id=?',
            [title, slug, cover, excerpt, display_order, JSON.stringify(content), created_at, updated_at, id]);

        if (result.affectedRows === 0) {
            throw createResponseError('Failed to update post', 500);
        }

        return {
            updated: updatedPost as PostType,
            old: prevPost[0] as PostType
        };

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'updatePostInDB');

/**
 * Inserts a post into the database.
 *
 * @param {PostType} post - The post object to be inserted.
 * @return {Promise<{ success: boolean, data: PostType }>} A promise that resolves to an object containing the success flag and the inserted post data.
 * @throws {Error} If any of the required fields are missing or if there is an error inserting the post.
 */

export const insertPostToDB = errorHandlerDB(async (post: PostType): Promise<{ success: boolean, data: PostType }> => {
    const { title, cover, excerpt, content } = post;

    if (!title) {
        throw createResponseError('Missing required fields', 400);
    }

    const db = await createConnection();

    try {
        // Retrieve the maximum display order
        const [rows] = await db.query<RowDataPacket[]>('SELECT MAX(`display_order`) as max_display_order FROM `posts`');

        let display_order = 0;

        if (rows.length === 1 || typeof rows[0].max_display_order === 'number') {
            display_order = rows[0].max_display_order + 1;
        }
        // set values
        const created_at = new Date();
        const updated_at = new Date();

        const slug = slugify(title);

        // Insert the post

        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO `posts` (`title`, `slug`, `cover`, `excerpt`, `content`, `created_at`, `updated_at`, `display_order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, slug, cover, excerpt, JSON.stringify(content), created_at, updated_at, display_order]
        );

        if (result.affectedRows === 0) {
            throw createResponseError('Failed to insert post', 500);
        }

        return {
            success: true,
            data: {
                id: result.insertId,
                title,
                slug,
                cover,
                excerpt,
                content,
                created_at,
                updated_at,
                display_order
            }
        };

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'insertPostToDB');

/**
 * Retrieves posts from the database based on the provided ID and display order revalidation flag.
 *
 * @param {number | null} id - The ID of the post to retrieve. If not provided, all posts are retrieved.
 * @param {boolean} revalidateDisplayOrder - Flag indicating whether to revalidate the display order of the posts.
 * @return {Promise<RowDataPacket[]>} A promise that resolves to an array of posts.
 * @throws {Error} If the ID is not a number or if no posts are found.
 */
export const getPostsFromDB = errorHandlerDB(async (id?: number | null, revalidateDisplayOrder?: boolean): Promise<RowDataPacket[]> => {
    const db = await createConnection();

    try {
        if (id && typeof id !== 'number') {
            throw createResponseError('Invalid id', 400);
        }

        let [posts] = await db.query<RowDataPacket[]>(`SELECT * FROM \`posts\` ${id ? 'WHERE id=?' : 'ORDER BY display_order ASC'}`, [id]);

        if (revalidateDisplayOrder) {

            posts = posts.map((p, i) => {
                if (p.display_order !== i) {
                    db.query<ResultSetHeader>('UPDATE `posts` SET display_order=? WHERE id=?', [i, p.id]);
                    return { ...p, display_order: i };
                }
                return p;
            });
        }

        return posts;

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'getPostFromDB');

/**
 * Get a post from the database.
 *
 * @param {number} id - The ID of the post to retrieve.
 * @return {Promise<PostType>} A promise that resolves to the retrieved post.
 * @throws {Error} If the ID is not a number or if no post is found.
 */
export const deletePostFromDB = errorHandlerDB(async (id: number): Promise<PostType> => {

    if (!id || typeof id !== 'number') {
        throw createResponseError('Invalid id', 400);
    }    

    const db = await createConnection();

    try {
        const [post] = await db.query<RowDataPacket[]>('SELECT * FROM `posts` WHERE id=?', [id]);

        if (!post.length) {
            throw createResponseError('Post non trouvé', 404);
        }

        const [result] = await db.query<ResultSetHeader>('DELETE FROM `posts` WHERE id=?', [id]);

        if (result.affectedRows === 0) {
            throw createResponseError('La suppression de ce post a échoué', 500);
        }

        return post[0] as PostType;

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'deletePostFromDB');

/**
 * Retrieves a user from the database based on the provided username.
 *
 * @param {string} username - The username of the user to retrieve.
 * @return {Promise<RowDataPacket[]>} A promise that resolves to an array of RowDataPacket objects representing the user(s) matching the provided username.
 * @throws {Error} If there are too many failed login attempts within the last 24 hours for the given username.
 */
export const getUserFromDB = errorHandlerDB(async (username: string): Promise<RowDataPacket[]> => {
    const db = await createConnection();

    try {

        const [users] = await db.query<RowDataPacket[]>('SELECT * FROM `users` WHERE username=?', [username]);

        return users;

    } catch (e) {

        throw e;

    } finally {

        db.end();

    }
}, 'getUserFromDB');

/**
 * Retrieves a setting from the database based on the provided name.
 *
 * @param {string} name - The name of the setting to retrieve.
 * @return {Promise<RowDataPacket[]>} A promise that resolves to an array of RowDataPacket objects representing the setting(s) matching the provided name.
 * @throws {Error} If there are too many failed login attempts within the last 24 hours for the given username.
 */
export const getSettingFromDB = errorHandlerDB(async (name: string): Promise<RowDataPacket[]> => {
    const db = await createConnection();

    try {
        const sql = 'SELECT * FROM `settings` WHERE `name` = ?';
        const [setting] = await db.query<RowDataPacket[]>(sql, [name]);

        return setting;

    } catch (error) {

        throw error;

    } finally {
        db.end();
    }
}, 'getSettingFromDB');

export const saveSettingInDB = errorHandlerDB(async (name: string, value: string): Promise<{ updated: SettingType, old: SettingType }> => {
    const db = await createConnection();

    try {
        // Retrieve the setting data before updating
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM `settings` WHERE `name` = ?', [name]);

        if (rows.length === 0) {
            throw createResponseError('Setting not found', 404);
        }

        const oldSettingData = rows[0] as SettingType;

        // Update the setting
        const [updateResult] = await db.query<ResultSetHeader>(
            'UPDATE `settings` SET `value` = ? WHERE `name` = ?',
            [JSON.stringify(value), name]
        );

        // Verify the update
        if (updateResult.affectedRows === 0) {
            throw createResponseError('Failed to update setting', 500);
        }

        return {
            updated: {
                id: oldSettingData.id,
                name,
                value
            },
            old: oldSettingData
        };

    } catch (error) {

        throw error;

    } finally {
        db.end();
    }
}, 'getSettingFromDB');

export const getPageData = async (slug: string) => {

    const result = await getPagesFromDB(slug);

    if (!result || !result.length) {
        return null;
    }

    const page = { ...result[0], content: result[0].content };

    if (page) {

        const images: ImageType[] = [];

        for (const imageID of page.images) {
            const imageResult = await getImagesFromDB(imageID);
            images.push(imageResult[0]);
        }

        return { ...page, images: images };

    } else {
        return null;
    }
}
