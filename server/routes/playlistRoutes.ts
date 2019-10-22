import { Router } from 'express';

import { PlaylistController } from '../controllers/playlistController';

const playlistRouter = Router();
const playlistController = new PlaylistController();

playlistRouter.route('/playlists.html').get(playlistController.userPlaylists);

export { playlistRouter };