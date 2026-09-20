
import 'dotenv/config';
import express from 'express';

import authRoutes from './src/routes/auth.route.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import  adminRoutes  from './src/routes/admin.route.js';
import postRoutes from './src/routes/post.route.js';

const app = express();

app.use(express.json()); 

app.use('/auth', authRoutes);

app.use('/admin', adminRoutes);

app.use('/posts', postRoutes);


app.use(errorHandler);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

