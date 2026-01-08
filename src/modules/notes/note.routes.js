import express from 'express'
import { authenticate } from '../../middleware/auth.middleware.js'
import { addCollaboratorController, createNoteController, deleteCollaboratorController, deleteNoteController, generateShareLinkController, getCollaboratorController, getMyNoteByIdController, getMyNotesController, getSharedNoteController, updateNotesController } from './note.controller.js'

const noteRouter = express.Router()

// Create & list notes
noteRouter.post("/", authenticate, createNoteController);
noteRouter.get("/", authenticate, getMyNotesController);

// Get single note by ID 
noteRouter.get("/:noteId", authenticate, getMyNoteByIdController);

// Update & delete note
noteRouter.put("/:noteId", authenticate, updateNotesController);
noteRouter.delete("/:noteId", authenticate, deleteNoteController);

// Collaborators 
noteRouter.post("/:noteId/collaborator", authenticate, addCollaboratorController);
noteRouter.get("/:noteId/collaborator", authenticate, getCollaboratorController);
noteRouter.delete("/:noteId/collaborator/:collaboratorId",authenticate, deleteCollaboratorController)

//Share-Link
noteRouter.post("/:noteId/share", authenticate,generateShareLinkController)
noteRouter.get("/share/:token", getSharedNoteController)


export default noteRouter