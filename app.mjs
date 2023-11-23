import express from 'express'
import { processGetSequenceResponse } from './api/sequence.mjs'
import swagger from 'swagger-ui-dist'


const app = express();
const port = 3000;

const pathToSwaggerUi = swagger.absolutePath();


app.use( '/messages', express.static( './view/sequence-details.html'))
app.use( '/swagger', express.static( './view/ea-board-swagger.html'))
app.use( '/js', express.static( './view/js'))
app.use( '/swagger-ui', express.static(pathToSwaggerUi));
app.use( '/api/swagger/domain.yaml', express.static('./domain.yaml'));

app.get('/', async (req, res) => {
    res.send('Hello, World!')
});

app.get('/api/messages', processGetSequenceResponse );


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

