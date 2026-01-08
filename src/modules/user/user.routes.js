import express from 'express'
import { signup } from './user.controller.js';
import { login } from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';

const UserRouter = express.Router()

UserRouter.post("/signup", signup)
UserRouter.post("/login", login)

export default UserRouter