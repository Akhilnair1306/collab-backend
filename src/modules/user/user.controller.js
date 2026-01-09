import { createUser } from "./user.service.js";
import { loginUser } from "./user.service.js";

export const signup = async (req,res) => {
    try {
        const {name, email, password, role} = req.body
        
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            })
        }

        const user = await createUser({ name, email, password, role });
        res.status(201).json({
            message: "User created successfully",
            user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const login = async (req,res) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            })
        }

        const result = await loginUser({email, password});

         res.status(200).json({
            message: "Login Successful",
            token: result.token,
            user: result.user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getMeController = async (req, res) => {
  try {
    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user info",
    });
  }
};
