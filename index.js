import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import demo from './routes/demo.js';
import register from './routes/register.js';
import login from './routes/login.js';
import auth from './routes/auth.js';
import { index } from './coretify.config.js';
import cors from 'cors';

const app = express();


// Set the views directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors(index.corsOptions));

app.use('/demo', demo);
app.use('/register', register);
app.use('/login', login);
app.use('/auth', auth);

app.get('/', (req, res) => {
    const data = { title: 'Welcome', message: 'Hello, Coretify!' };
    res.render('index', data);  // Render the index.ejs view
});

app.listen(index.serverPort, () => {
    console.log(`Server is running at http://localhost:${index.serverPort}`);
});
