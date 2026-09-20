import bcrypt from 'bcrypt';
import { db } from '../prisma/db.ts';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken
} from '../utils/token.js';
import { appError } from '../utils/appError.js';
import { registerUser, loginUser, refreshAccessToken, getUserProfile, logoutUser } from '../services/auth.service.js';

// Register endpoint
export async function register(req, res) {

    const  result = await registerUser(req.body);
   
    res.status(201).json({ 
        message: 'User registered successfully',
        user: {
            id: result.id,
            name: result.name,
            email: result.email
        }
     });
}

//login
//login endpoint
export  async function login(req, res) {

    const result = await loginUser(req.body);
    

    res.status(200).json({
        message: 'Login successful',
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
    });

}


//refresh  controller
export async function refreshToken(req, res) {
  

    const result = await refreshAccessToken(req.body);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      token: result.token,
      refreshToken: result.refreshToken
    });
}


//logout controller
export async function logout(req, res) {
  
  await logoutUser(req.body);


  return res.status(200).json({
    message: 'Logged out successfully'
  });
}


export async function getProfile(req, res) {
  
   const result = await getUserProfile(req.user.userId);

  return res.json(result);
}