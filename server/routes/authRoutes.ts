import { Router } from 'express';

import { AuthController } from '../controllers/authController';

const authRouter = Router();
const authController = new AuthController();

authRouter.route('/login').get(authController.userLogin);

authRouter.route('/callback').get(authController.userCallback);

export { authRouter };