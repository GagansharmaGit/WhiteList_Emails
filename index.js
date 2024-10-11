import express from 'express';
import { function1 } from './functions/function1.js';

const app = express();
const PORT = 4000; 

app.use(express.json());

app.get('/ValidEmails', async (req, res) => {
    const result1 = await function1(req?.body);
    res.json(result1);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
