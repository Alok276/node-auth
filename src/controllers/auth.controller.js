import bcrypt from 'bcrypt';
import { db } from '../prisma/db.ts';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken
} from '../utils/token.js';

// Register endpoint
export async function register(req, res) {

    const { name, email, password } = req.body;
    console.log(name, email);


    //check for the required fields

    if(!name || !email || !password) {

      return res.status(400).json({ message: 'Name, email, and password are required' });

    }


    // check if user already exists
    
    const existingUser = await db.orm.public.User.
        where({email: email}).first();

    if(existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }


    //convert the password into the hashed password 
    const hashedPassword = await bcrypt.hash(password, 10);

     console.log('Original:', password);
    console.log('Hashed:', hashedPassword);

    //insert the user into the database
    const user = await db.orm.public.User.create({
        name :name,
        email: email,
        password: hashedPassword
    });


    res.status(201).json({ 
        message: 'User registered successfully',
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
     });
}

//login
//login endpoint
export  async function login(req, res) {

    const { email, password } = req.body;

    //check for the required fields
    
    if(!email || !password) {
       return res.status(400).json({ message: 'Email and password are required' });
    }

    //check if user exists
    const user = await db.orm.public.User.where({email: email}).first();

    if(!user) {
        return res.status(401).json({ message: 'User does not exist' });
    }

    //compare the the password with the hashed password
    const isPasswordValid = await bcrypt.compare(password , user.password);
    
    if(!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

   const token = generateAccessToken(user.id);
   
   const refreshToken = generateRefreshToken(user.id);

    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = Temporal.Now.instant().add({
    seconds: 7 * 24 * 60 * 60
    });

        //add the refresh token to the database 
    await db.orm.public.Session.create({
        userId: user.id,
        refreshTokenHash: refreshTokenHash,
        expiresAt: expiresAt
    });

    res.status(200).json({
        message: 'Login successful',
        token,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });

}

export async function refreshToken(req, res) {
  const { refreshToken: incomingToken } = req.body;

  if (!incomingToken) {
    return res.status(400).json({
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(
      incomingToken,
      process.env.JWT_REFRESH_SECRET
    );

    const tokenHash = hashToken(incomingToken);

    const session = await db.orm.public.Session
      .where({ refreshTokenHash: tokenHash })
      .first();

    if (!session) {
      return res.status(401).json({
        message: 'Refresh token has been revoked'
      });
    }

    if (session.expiresAt <= Temporal.Now.instant()) {
      await db.orm.public.Session
        .where({ id: session.id })
        .delete();

      return res.status(401).json({
        message: 'Refresh token has expired'
      });
    }

    const accessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    const newRefreshTokenHash = hashToken(newRefreshToken);

    await db.orm.public.Session.create({
      data: {
        userId: decoded.userId,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: Temporal.Now.instant().add({
          seconds: 7 * 24 * 60 * 60
        })
      }
    });

    await db.orm.public.Session
      .where({ id: session.id })
      .delete();

    return res.status(200).json({
      message: 'Token refreshed successfully',
      token: accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired refresh token'
    });
  }
}

export async function logout(req, res) {
  const { refreshToken: incomingToken } = req.body;

  if (!incomingToken) {
    return res.status(400).json({
      message: 'Refresh token is required'
    });
  }

  const tokenHash = hashToken(incomingToken);

  const session = await db.orm.public.Session
    .where({ refreshTokenHash: tokenHash })
    .first();

  if (!session) {
    return res.status(404).json({
      message: 'Session not found'
    });
  }

  await db.orm.public.Session
    .where({ id: session.id })
    .delete();

  return res.status(200).json({
    message: 'Logged out successfully'
  });
}


export async function getProfile(req, res) {
  const user = await db.orm.public.User
    .where({ id: req.user.userId })
    .first();

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email
  });
}