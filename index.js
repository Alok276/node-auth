
import 'dotenv/config';
import express from 'express';

import authRoutes from './src/routes/auth.route.js';

const app = express();

app.use(express.json()); 

app.use('/auth', authRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

