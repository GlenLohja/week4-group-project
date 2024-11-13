import express, { Router } from 'express';
import { deleteSong, getSongsFromGenius, saveSong } from '../controllers/musicController';
import { getPlaylists, savePlaylist,getSongsByUserIdAndPlaylistId } from '../controllers/playlistController';
import { authenticateJWT } from '../middlewares/jwtMiddleware';

const musicRouter: Router = express.Router();

musicRouter.get('/songs/:playlistId', authenticateJWT, getSongsByUserIdAndPlaylistId);
musicRouter.get('/music', authenticateJWT, getSongsFromGenius);
musicRouter.post('/save-song', authenticateJWT, saveSong);
musicRouter.delete('/songs/:id', authenticateJWT, deleteSong);
musicRouter.get('/playlists/', authenticateJWT, getPlaylists)
musicRouter.post('/playlists', authenticateJWT, savePlaylist)

export default musicRouter;