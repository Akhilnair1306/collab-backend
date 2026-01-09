import prisma from "../../config/db.js";
import { addCollaborator, createNote, deleteNote, generateShareLink, getCollaborator, getMyNotes, getNotesById, getSharedNote, removeCollaborator, searchNotesforUser, uptNotes } from "./note.service.js";

export const createNoteController = async(req, res) => {
    try {
        const { title, content } = req.body
        if ( !title ) {
            return res.status(400).json({
                message: "Title is required"
            })
        }

        const note = await createNote({
            title,
            content,
            ownerId: req.user.id
        })

         res.status(200).json({
            message: "Note created successfully",
            note
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

export const getMyNotesController = async(req,res) => {
    try {
        const userId = req.user.id
        const notes = await getMyNotes(userId)

        res.status(200).json({
            notes
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
export const getMyNoteByIdController = async(req,res) => {
    try {
        const noteId = req.params.noteId
        const userId = req.user.id

        const {note, myRole} = await getNotesById({
            noteId,
            userId
        })

        res.status(200).json({
            note,
            myRole
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
export const updateNotesController = async(req,res) => {
    try {
        const userId = req.user.id
        const noteId = req.params.noteId
        const { title, content} = req.body
        const notes = await uptNotes({
            noteId,
            userId,
            title,
            content
        })

        res.status(200).json({
            message: "Note updated successfully",
            notes
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const deleteNoteController = async(req,res) => {
    try {
        const noteId = req.params.noteId

        await deleteNote ({
            noteId,
            userId: req.user.id,
            userRole: req.user.role
        })

        res.status(200).json({
            message: "Note deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const addCollaboratorController = async(req,res) => {
    try {
        const noteId = req.params.noteId
        const {email, role} = req.body;
        
        if (!email || !role) {
            res.status(400).json({
                message: 'Email and Role is Required'
            })
        }

        const collaborator = await addCollaborator({
            noteId,
            ownerId: req.user.id,
            collaboratorEmail: email,
            role
        })

        res.status(200).json({
            message: "Collaborator added",
            collaborator
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getCollaboratorController = async(req,res) => {
    try {
        const noteId = req.params.noteId
        const userId = req.user.id

        const collaborators = await getCollaborator({
            noteId,
            userId
        })

        res.status(200).json({
            collaborators
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const deleteCollaboratorController = async(req,res) => {
    try {
        const {noteId, collaboratorId} = req.params

        await removeCollaborator({
            noteId,
            ownerId: req.user.id,
            collaboratorId
        })

        res.status(200).json({
            message: "Collaborator removed successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


export const generateShareLinkController = async(req,res) => {
    try {
        const {noteId} = req.params
        const userId = req.user.id

        const token = await generateShareLink({
            noteId,
            userId: userId
        })

        res.status(200).json({
            shareUrl: `${process.env.FRONTEND_URL}share/${token}`
        })
    } catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getSharedNoteController = async(req,res) => {
    try {
        const {token} = req.params
        const note = await getSharedNote({
            token
        })
        res.status(200).json({note})
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const searchNotesController = async(req,res) => {
    try {
        const {q} = req.query

        const notes = await searchNotesforUser({
            userId: req.user.id,
            query: q
        })

        res.status(200).json({
            notes
        })
    } catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
}