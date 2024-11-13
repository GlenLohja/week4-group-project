// Display all songs that belong to a specific user id
import { Request, Response } from 'express';
import { query } from '../database/db';
import axios from 'axios';
import { createClient } from 'redis';

const GENIUS_API_URL = process.env.GENIUS_HOST + '/search';
const GENIUS_API_TOKEN = process.env.GENIUS_CLIENT_ACCESS_TOKEN;
const DEFAULT_EXPIRATION = Number(process.env.DEFAULT_EXPIRATION_TIME); // Default expiration time for cached data in seconds

export const getSongsFromGenius = async (req: Request, res: Response): Promise<Response | any> => {
    const searchQuery = req.query.searchQuery as string;
    console.log('searchQuery', searchQuery);
    const searchQueryEncoded = encodeURIComponent(searchQuery);
    const userId = (req as Request & { user: any }).user.id

    // Create a Redis client
    const redisClient = createClient({
        socket: {
            reconnectStrategy: function (retries) {
                if (retries > 20) {
                    console.log("Too many attempts to reconnect. Redis connection was terminated");
                    return new Error("Too many retries.");
                }
                return retries * 500;
            }
        }
    });
    redisClient.on('error', error => console.error('Redis client error:', error));
    redisClient.connect();
    const cachedData = await redisClient.get(`${searchQuery}`);
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const { rows } = await query('SELECT genius_id FROM songs WHERE user_id=$1', [userId]);
        const updatedHits = parsedData.map((hit: any) => {
            const isSaved = rows.length > 0 && rows.some((row: any) => row.genius_id === hit.result.id);
            return { ...hit.result, isSaved };
        });
        return res.json(updatedHits);
    }

    try {
        console.log('searchQueryEncoded', searchQueryEncoded);
        const response = await axios.get(GENIUS_API_URL, {
            params: {
                q: searchQueryEncoded
            },
            headers: {
                'Authorization': `Bearer ${GENIUS_API_TOKEN}`
            }
        });
        redisClient.set(`${searchQuery}`, JSON.stringify(response.data.response.hits));
        redisClient.expire(`${searchQuery}`, DEFAULT_EXPIRATION);
        if (response.data && response.data.response && response.data.response.hits) {

            const { rows } = await query('SELECT genius_id FROM songs WHERE user_id=$1', [userId]);

            const updatedHits = response.data.response.hits.map((hit: any) => {
                const isSaved = rows.length > 0 && rows.some((row: any) => row.genius_id === hit.result.id);
                return { ...hit.result, isSaved };
            });

            return res.json(updatedHits);
        } else {
            return res.status(400).json({ message: 'No songs found' });
        }
    } catch (error) {
        console.error('Error fetching songs from Genius API:', error);
        return res.status(500).json({ message: 'Error fetching songs from Genius API' });
    }
};

export const saveSong = async (req: Request, res: Response): Promise<Response | any> => { // Save a song to the database for a specific user id   
    const userId = (req as Request & { user: any }).user
    const { title, singer, cover, created_date, description, url, id, playlistId } = req.body
    try {
        await query("INSERT INTO songs (name, description, singer, cover_image, user_id, created_at, song_url, genius_id, playlist_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [title, description, singer, cover, userId.id, created_date, url, id, playlistId])

        return res.status(201).json({ message: "Song was saved successfully!" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export const deleteSong = async (req: Request, res: Response): Promise<Response | any> => {
    const userId = (req as Request & { user: any }).user
    const songId = req.params.id
    try {
        const result = await query("DELETE FROM songs WHERE user_id = $1 AND genius_id = $2", [userId.id, songId])
        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Song not found` })
        }
        return res.status(200).json({ message: `Song deleted successfully` })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: `Internal server error` })
    }
}