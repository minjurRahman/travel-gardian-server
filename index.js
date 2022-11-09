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
        const reviewCollection = client.db('travelGuardian').collection('userReview');

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
            res.send(service);
        })


        //Users Review
        app.post('/userReview', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/displayReview', async(req, res) =>{
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        app.patch('/userReview/:id', async (req, res) =>{
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id)};
            const updatedDoc = {
                $set:{
                    status: status
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);

        })

        app.delete('/userReview/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query)
            res.send(result);
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