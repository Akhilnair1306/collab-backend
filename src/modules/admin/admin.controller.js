import { deleteNode, getAllNotesAdmin } from "./admin.service.js"

export const getAllNotesAdminController = async(req,res) => {
    try {
        const notes = await getAllNotesAdmin()
        res.status(200).json({
            notes
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const deleteAnyNoteAdminController = async(req,res) => {
    try {
        const {noteId} = req.params;
        await deleteNode(noteId)
        res.json({message: "Note deleted by admin"})
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}