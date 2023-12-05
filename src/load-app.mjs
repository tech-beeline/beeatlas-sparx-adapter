import express from 'express'
import Router from './routes/index.mjs'

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', Router)
app.use((err, req, res, next) => {
    res.status(500).send(err.message);
})

export default app;