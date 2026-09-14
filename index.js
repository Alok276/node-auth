
import 'dotenv/config';
import express from 'express';
import {db} from './src/prisma/db.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './src/middleware/auth.js';

const app = express();

app.use(express.json()); 

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})


app.get('/users', async (req, res) => {

    const users = await db.orm.public.User.all();

    res.json(users);

});


// Register endpoint
app.post('/register', async (req, res) => {

    const { name, email, password } = req.body;
    console.log(name, email);


    //check for the required fields

    if(!name || !email || !password) {

        res.status(400).json({ message: 'Name, email, and password are required' });

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
})



//login endpoint
app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    //check for the required fields
    
    if(!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
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

    const token = jwt.sign({
        id: user.id
    }
    , process.env.JWT_SECRET, { expiresIn: '1h' }
    );

    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });

});

//profile
app.get('/profile', authenticateToken, async (req, res) => {
  const user = await db.orm.public.User
    .where({ id: req.user.userId })
    .first();

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email
  });
});
