import { Request, Response } from 'express';
import { query } from '../database/db';

export const getPlaylists = async (req: Request, res: Response): Promise<Response | any> => {
    const userId = (req as Request & { user: any }).user
    try {
        const result = await query(`SELECT * FROM playlists WHERE user_id = $1`, [userId.id])
        const playlists = result.rows

        if (!playlists) {
            return res.status(404).json({ message: `Playlist not found` })
        }

        return res.status(200).json({ message: 'Playlist data', playlists })

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: `Internal server error` })
    }
}

export const getSongsByUserIdAndPlaylistId = async (req: Request, res: Response): Promise<Response | any> => {
    const userId = (req as Request & { user: any }).user
    const playlistId = req.params.playlistId
    try {
        console.log(playlistId)
        const result = await query(`SELECT * FROM songs WHERE user_id = $1 AND playlist_id = $2`, [userId.id, playlistId])
        const songs = result.rows

        if (!songs) {
            return res.status(404).json({ message: `Songs not found` })
        }

        return res.status(200).json({ message: 'Songs data', songs })

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: `Internal server error` })
    }
}

export const savePlaylist = async (req: Request, res: Response): Promise<Response | any> => {
    const userId = (req as Request & { user: any }).user
    const { playlist_name } = req.body
    try {
        await query("INSERT INTO playlists (name, user_id) VALUES ($1, $2)", [playlist_name, userId.id])

        const result = await query(`SELECT * FROM playlists WHERE user_id = $1`, [userId.id])
        const playlists = result.rows

        return res.status(201).json({ playlists, message: "Playlist was saved successfully!" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error!" })
    }
}