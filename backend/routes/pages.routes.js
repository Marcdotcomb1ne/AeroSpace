import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pageRouter = express.Router();

pageRouter.get('/', (req, res) => {
    console.log(`\n⬆️  Rota / acessada.`);
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

pageRouter.get('/desktop', (req, res) => {
    console.log(`\n⬆️  Rota /desktop acessada.`);
    res.sendFile(path.join(__dirname, '..', 'views', 'desktop.html'));
});


export default pageRouter;

