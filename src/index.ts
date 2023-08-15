require('dotenv').config();

import path from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';


import ImageRoutes from './routes/images.routes';

const app = express();

const port = process.env.PORT || 4005;

// const corsOptions = {
//     origin: process.env.APP_ORIGIN && process.env.APP_ORIGIN != '*' ? process.env.APP_ORIGIN.split(',') : '*',
//     optionsSuccessStatus: 200
// };
app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/images', ImageRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${port}`)
});