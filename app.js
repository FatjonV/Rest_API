import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import { graphqlHTTP } from 'express-graphql';

import graphqlSchema from './graphql/schema.js';
import graphqlResolver from './graphql/resolvers.js';
import auth from './middleware/auth.js';
import clearImage from './util/file.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

// const feedRoutes = require('./routes/feed'); 
// const authRoutes = require('./routes/auth'); // comment these lines

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

//app.use(bodyParser.urlencoded());   //  x-www-form-urlencoded <form>  comment this line

app.use(bodyParser.json());        //application/json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// app.use('/feed', feedRoutes);
// app.use('/auth', authRoutes); // comment these lines

app.use(auth);

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error ('Not authenticated!');
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file provided!' });   
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath)
    }
    return res.status(201).json({ message: 'File stored.', filePath: req.file.path })
})

app.use('/graphql', 
    graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
        if(!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An error occurred.';
        const code = err.originalError.code || 500;
        return { message: message, status: code, data: data };
    }
  })
);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
.connect("mongodb+srv://fatjonveseli:fatjoni2002@cluster0.lfy2m4e.mongodb.net/messages")
.then(result => { 
 app.listen(8080)
//  const io = require('./socket').init(server);
//  io.on('connection', socket => {
//     console.log('Client connected');
//  });                                           // commnet these lines for moment
})  
.catch(error => console.log(error));

