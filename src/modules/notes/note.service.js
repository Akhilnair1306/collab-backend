import prisma from "../../config/db.js";
import crypto from 'crypto'

export const createNote = async ({ title, content, ownerId }) => {
    const note = await prisma.note.create({
        data: {
            title,
            content,
            ownerId,
        },
    });

    return note;
};


export const getMyNotes = async (userId) => {
    const notes = await prisma.note.findMany({
        where: {
            OR: [
                { ownerId: userId },
                {
                    collaborators: {
                        some: {
                            userId
                        }
                    }
                }
            ]
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            collaborators: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: {
            updatedAt: "desc",
        }
    })
    return notes;
}


export const getNotesById = async ({ noteId, userId }) => {
    const note = await prisma.note.findUnique({
        where: {
            id: noteId,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            collaborators: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });


    if (!note) {
        throw new Error("No note with the specified id")
    }

    const isOwner = note.ownerId === userId
    if (isOwner) {
        return {
            note,
            myRole: "EDITOR"
        }
    }

  const collaborator = note.collaborators.find(
    (c) => c.userId === userId
  );

  if (!collaborator) {
    throw new Error("You don't have access to this note");
  }


  return {
    note,
    myRole: collaborator.role, 
  };
}

export const uptNotes = async ({ noteId, userId, title, content }) => {
    const note = await prisma.note.findUnique({
        where: {
            id: noteId
        },
        include: {
            collaborators: true,
        }
    })

    if (!note) {
        throw new Error("note with the specified Id not found")
    }

    const isOwner = note.ownerId === userId

    const isEditor = note.collaborators.some(
        (c) => c.userId === userId && c.role === "EDITOR"
    )

    if (!isOwner && !isEditor) {
        throw new Error("You don't have the permission to edit this note")
    }

    return prisma.note.update({
        where: { id: noteId },
        data: {
            title,
            content,
        }
    })
}

export const deleteNote = async ({ noteId, userId, userRole }) => {
    const note = await prisma.note.findUnique({
        where: {
            id: noteId
        }
    });

    if (!note) {
        throw new Error("Note not found")
    }

    const isOwner = note.ownerId === userId
    const isAdmin = userRole === "ADMIN"

    if (!isOwner && !isAdmin) {
        throw new Error("You don't have permission to delete this note")
    }

    await prisma.noteCollaborator.deleteMany({
        where: { noteId }
    })

    await prisma.note.delete({
        where: {
            id: noteId
        }
    })

    return true
}

export const addCollaborator = async ({ noteId, ownerId, collaboratorEmail, role }) => {
    const note = await prisma.note.findUnique({
        where: {
            id: noteId
        }
    })

    if (!note) {
        throw new Error("No such note exists")
    }

    if (note.ownerId !== ownerId) {
        throw new Error("Only Owner can add Collaborators")
    }

    const user = await prisma.user.findUnique({
        where: { email: collaboratorEmail }
    })

    if (!user) {
        throw new Error("No such user with the specified email exists")
    }

    if (user.id === ownerId) {
        throw new Error("User is already the owner")
    }

    const existing = await prisma.noteCollaborator.findUnique({
        where: {
            noteId_userId: {
                noteId,
                userId: user.id
            }
        }
    });

    if (existing) {
        throw new Error("Collaborator already exists")
    }

    return prisma.noteCollaborator.create({
        data: {
            noteId,
            userId: user.id,
            role,
        }
    })
}

export const getCollaborator = async ({ noteId, userId }) => {
    const note = await prisma.note.findUnique({
        where: {
            id: noteId
        },
        include: {
            collaborators: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    })

    if (!note) {
        throw new Error("No such note exists")
    }

    const isOwner = note.ownerId == userId
    const isCollaborator = note.collaborators.some(
        (c) => c.userId === userId
    )

    if (!isOwner && !isCollaborator) {
        throw new Error("You don't have access to this file")
    }

    return note.collaborators
}

export const removeCollaborator = async ({ noteId, ownerId, collaboratorId }) => {
    const note = await prisma.note.findUnique({
        where: {
            id: noteId
        }
    })

    if (!note) {
        throw new Error("Note with the specified Id doesn't exist")
    }

    if (note.ownerId !== ownerId) {
        throw new Error("Only the owner can remove Collaborator ")
    }

    if (collaboratorId == ownerId) {
        throw new Error("Owner cannot be removed")
    }

    const collaborator = await prisma.noteCollaborator.findUnique({
        where: {
            noteId_userId: {
                noteId,
                userId: collaboratorId
            }
        }
    })

    if (!collaborator) {
        throw new Error("Collaborator not found")
    }

    await prisma.noteCollaborator.delete({
        where: {
            noteId_userId: {
                noteId,
                userId: collaboratorId
            }
        }
    })

    return true
}

export const generateShareLink = async({noteId, userId}) => {
    const note = await prisma.note.findUnique({
        where: {
            id: noteId
        }
    })

    if (!note || note.ownerId !== userId) {
        throw new Error("Only Owner can Generate Sharable Links")
    }

    const token = crypto.randomUUID()

    const update = await prisma.note.update({
        where: {
            id: noteId
        },
        data: {
            shareToken: token,
            isPublic: true
        }
    })

    return token
}

export const getSharedNote = async(token) => {
    const note = await prisma.note.findUnique({
        where: {
            shareToken: token.token,
            isPublic: true
        },
        select: {
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true
        }
    })

    if (!note) {
        throw new Error("No note available")
    }

    return note
}

export const searchNotesforUser = async({userId, query}) => {
    if (!query || query.trim === "") {
        return []
    }

    return prisma.note.findMany({
        where: {
            AND: [
                {
                    OR: [
                        {ownerId: userId},
                        {
                            collaborators: {
                                some: {
                                    userId: userId
                                }
                            }
                        }
                    ]
                },
                {
                    OR: [
                        {
                            title: {
                                contains: query,
                                mode: "insensitive"
                            }
                        },
                        {
                            content: {
                                contains: query,
                                mode: "insensitive"
                            }
                        }
                    ]
                }
            ]
        },
        orderBy: {
            updatedAt: "desc"
        },
        select: {
            id: true,
            title: true,
            updatedAt: true,
            ownerId: true
        }
    })
}


export const searchCollaboratorCandidates= async({noteId, requesterId, emailQuery}) => {
    if (!emailQuery || emailQuery.trim().length < 2) {
        return []
    }

    const note = await prisma.note.findUnique({
        where: {
            id: noteId
        },
        include: {
            collaborators: true
        }
    })

    if (!note) {
        throw new Error("Note not found")
    }

    const isOwner = note.ownerId === requesterId
    // const collaborator = note.collaborators.some(
    //     (c) => c.userId ===
    // )
    if (!isOwner) {
        throw new Error("Not allowed to add collabrator")
    }

    const excludedIds = [
        note.ownerId,
        ...note.collaborators.map((c) =>{c.userId})
    ].filter(Boolean); 

    return prisma.user.findMany({
        where: {
            email: {
                contains: emailQuery,
                mode: 'insensitive'
            },
            id: {
                notIn: excludedIds
            }
        },
        select: {
            id: true,
            email: true
        },
        take: 10,
    })
}