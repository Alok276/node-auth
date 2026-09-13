
import express from 'express';
import {db} from './src/prisma/db.ts';

const app = express();

app.use(express.json()); 

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})


app.get('/users', async (req, res) => {

    const users = await db.orm.public.User.all();

    res.json(users);

});


app.get('/hello' , (req, res) => {
    res.send('welcome to the server ');
});

app.get('/about' , (req,res) =>{
    res.send('This is the about page');
});

// app.get('/users', (req, res) =>{ 
//     res.send('This is the users page');
// }); 

app.post('/test', (req, res) => {

  res.json({ message: 'Data received successfully' ,
             data: req.body
  });

});