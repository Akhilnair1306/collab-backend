import express from 'express'
import { authenticate } from '../../middleware/auth.middleware.js'
import { authorizeRoles } from '../../middleware/role.middleware.js'
import { deleteAnyNoteAdminController, getAllNotesAdminController } from './admin.controller.js'

const adminRouter = express.Router()

adminRouter.get("/", authenticate, authorizeRoles("ADMIN"), getAllNotesAdminController)
adminRouter.delete("/:noteId", authenticate,authorizeRoles("ADMIN"), deleteAnyNoteAdminController)

export default adminRouter