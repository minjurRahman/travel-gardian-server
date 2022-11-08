const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//Middle Wares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('Travel Guardian Server Is running')
})









app.listen(post, () =>{
    console.log(`Travel Guardian Server Running On Port ${port}`);
})