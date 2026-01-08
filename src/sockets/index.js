import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { notePresence } from "./presence.js";

export const initSockets = (io) => {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            socket.user = {
                id: decoded.userId,
                role: decoded.role,
            };

            next();
        } catch (error) {
            next(new Error("Invalid socket token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected", socket.user.id);

        socket.on("join-note", async ({ noteId }) => {
            try {
                if (!noteId) {
                    return socket.emit("join-error", "noteId missing");
                }

                const note = await prisma.note.findUnique({
                    where: { id: noteId },
                    include: { collaborators: true },
                });

                if (!note) {
                    return socket.emit("join-error", "Note not found");
                }

                const isOwner = note.ownerId === socket.user.id;
                const collaborator = note.collaborators.find(
                    (c) => c.userId === socket.user.id
                );

                if (!isOwner && !collaborator) {
                    return socket.emit("join-error", "Access denied");
                }

                const myRole = isOwner ? "EDITOR" : collaborator.role;
                const room = `note:${noteId}`;

                socket.join(room);

                if (!notePresence.has(room)) {
                    notePresence.set(room, new Map())
                }

                const user = await prisma.user.findUnique({
                    where: {
                        id: socket.user.id
                    }
                })
                notePresence.get(room).set(socket.user.id, {
                    userId: socket.user.id,
                    email: user.email,
                    role: myRole,
                    editing: false
                })

                io.to(room).emit("presence-update", Array.from(
                    notePresence.get(room).values()
                ));
                socket.emit("note-joined", {
                    noteId,
                    title: note.title,
                    content: note.content,
                    myRole,
                });

                socket.to(room).emit("user-joined", {
                    userId: socket.user.id,
                });
            } catch (err) {
                console.error(err);
                socket.emit("join-error", "Failed to join note");
            }
        });

        socket.on("note-update", async ({ noteId, content, title }) => {
            try {
                if (!noteId || typeof content !== "string") {
                    return socket.emit("update-error", "Invalid payload")
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
                    return socket.emit("update-error", "Invalid payload")
                }

                const isOwner = note.ownerId === socket.user.id
                const collaborator = note.collaborators.find(
                    (c) => c.userId === socket.user.id
                )

                if (!isOwner && (!collaborator || collaborator.role !== "EDITOR")) {
                    return socket.emit("update-error", "You cannot edit this note");
                }
                await prisma.note.update({
                    where: { id: noteId },
                    data: {
                        title,
                        content,
                    }
                })

                const room = `note:${noteId}`
                socket.to(room).emit("note-updated", {
                    title,
                    content,
                    updatedBy: socket.user.id
                })

            } catch (error) {
                console.log(error)
                socket.emit("update-error", "Failed to update note");
            }
        })

        socket.on("editing-start", ({ noteId }) => {
            const room = `note:${noteId}`
            const roomPresence = notePresence.get(room)

            if (!roomPresence) return

            const user = roomPresence.get(socket.user.id)

            if (!user) return

            user.editing = true

            io.to(room).emit("presence-update", Array.from(roomPresence.values()));
        })

        socket.on("editing-stop", ({ noteId }) => {
            const room = `note:${noteId}`

            const roomPresence = notePresence.get(room)

            if (!roomPresence) return

            const user = roomPresence.get(socket.user.id)

            if (!user) return

            user.editing = false

            io.to(room).emit("presence-update", Array.from(roomPresence.values()));

        })

        socket.on("disconnect", () => {
            for (const [room, users] of notePresence.entries()) {
                if (users.has(socket.user.id)) {
                    users.delete(socket.user.id);

                    if (users.size === 0) {
                        notePresence.delete(room);
                    } else {
                        io.to(room).emit("presence-update", Array.from(users.values()));
                    }
                }
            }

            console.log("Socket disconnected", socket.user.id);
        });
    });
};
