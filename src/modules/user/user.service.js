import dotenv from 'dotenv'
dotenv.config()

import bcrypt from 'bcrypt'
// import { prisma } from '../../config/db.js'
import prisma from '../../config/db.js'
import jwt from 'jsonwebtoken'


const SALT_ROUNDS = 10

export const createUser = async ({name, email, password, role}) => {
    const exisitingUser = await prisma.user.findUnique({
        where: {email}
    })

    if (exisitingUser) {
        throw new Error("Email Id already Exists")
    }

    const hashed_password = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed_password,
            role,
        },
    });

    delete user.password;

    return user;

}

export const loginUser = async({email, password}) => {
    const user = await prisma.user.findUnique({
        where: {email},
    });

    if (!user) {
        throw new Error("Email not Valid")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Invalid password")
    }

    const token = jwt.sign(
        {userId: user.id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    )

    delete user.password

    return { token, user };
}