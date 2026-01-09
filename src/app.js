import express from "express";
import cors from 'cors'
import UserRouter from "./modules/user/user.routes.js";
import noteRouter from "./modules/notes/note.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";

const app = express()
app.use(cors());

app.use(express.json());
app.use("/api/users", UserRouter)
app.use("/api/notes", noteRouter)
app.use("/api/admin", adminRouter)

export default app;