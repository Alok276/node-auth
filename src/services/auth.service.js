import  bcrypt from 'bcrypt';
import {db} from  '../prisma/db.ts';
import jwt from 'jsonwebtoken';
import { appError } from '../utils/appError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken
} from '../utils/token.js';


//register user
export async function registerUser({name, email, password}){

    const existingUser = await db.orm.public.User
    .where({ email })
    .first();

  if (existingUser) {
    throw new appError('User already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.orm.public.User.create({
    name,
    email,
    password: hashedPassword
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };

}

//login user
export async function loginUser({ email, password }) {

  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    throw new appError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new appError('Invalid credentials', 401);
  }

    
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = Temporal.Now.instant().add({
    seconds: 7 * 24 * 60 * 60
  });

  await db.orm.public.Session.create({
    userId: user.id,
    refreshTokenHash,
    expiresAt
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}


//refresh-token
export async function refreshAccessToken({refreshToken}) {

        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
    
        const tokenHash = hashToken(refreshToken);
    
        const session = await db.orm.public.Session
          .where({ refreshTokenHash: tokenHash })
          .first();
    
        if (!session) {
          throw new appError('Refresh token has been revoked', 401);
        }
    
        if (Temporal.Instant.compare(session.expiresAt, Temporal.Now.instant()) <= 0) {
          await db.orm.public.Session
            .where({ id: session.id })
            .delete();
    
         throw new appError('Refresh token has expired', 401);
        }
        
        //get the current user 
        const user = await db.orm.public.User
                           .where({id: decoded.userId})
                           .first();
               
        if (!user) {
          throw new appError('User not found', 404);
        }                   
        
        const accessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(decoded.userId);
        const newRefreshTokenHash = hashToken(newRefreshToken);
    
        await db.orm.public.Session.create({
            userId: decoded.userId,
            refreshTokenHash: newRefreshTokenHash,
            expiresAt: Temporal.Now.instant().add({
              seconds: 7 * 24 * 60 * 60
            })
        });
    
        await db.orm.public.Session
          .where({ id: session.id })
          .delete();
    
        return {
          token: accessToken,
          refreshToken: newRefreshToken
        }

}

//logout 
export async function logoutUser({refreshToken}) {
 
      const tokenHash = hashToken(refreshToken);
    
      const session = await db.orm.public.Session
        .where({ refreshTokenHash: tokenHash })
        .first();
    
      if (!session) {
        throw new appError('Session not found', 404);
      }
    
      await db.orm.public.Session
        .where({ id: session.id })
        .delete();
    
      return true;
}

//getprofile

export async function getUserProfile(userId) {

    const user = await db.orm.public.User
    .where({ id: userId})
    .first();

  if (!user) {
   throw new appError('User not found', 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email
  }

}