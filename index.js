const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//Middle Wares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('Travel Guardian Server Is running')
})


//Database connection work
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bjaguop.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//CRUD Operation
async function run(){
    try{
        const serviceCollection = client.db('travelGuardian').collection('travelArea');

        app.get('/services', async(req, res) =>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            req.send(service);
        })




    }
    catch(error){
        console.log(error.name, error.message.bold, error.stack)
    }
    finally{

    }
}

run();








app.listen(port, () =>{
    console.log(`Travel Guardian Server Running On Port ${port}`);
})