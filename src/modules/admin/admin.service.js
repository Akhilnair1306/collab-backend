import prisma from "../../config/db.js"

export const getAllNotesAdmin = async () => {
    return prisma.note.findMany({
        orderBy: {
            createdAt: "desc"
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            collaborators: {
            include: {
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        }
        },
        
    })
}

export const deleteNode = async(noteId) => {

    await prisma.noteCollaborator.deleteMany({
        where: {noteId}
    })

    await prisma.note.delete({
        where: {
            id: noteId
        }
    })
}