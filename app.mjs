import express from 'express'
import { processGetSequenceResponse } from './api/sequence.mjs'


const app = express();
const port = 3000;

app.use( '/messages', express.static( './view/sequence-details.html'))
app.use( '/js', express.static( './view/js'))

app.get('/', async (req, res) => {
    res.send('Hello, World!')
});

app.get('/api/messages', processGetSequenceResponse );


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

