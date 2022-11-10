const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

//Verify JWT token
function verifyJWT(req, res, next){
    const authJWT = req.headers.authorization;

    if(!authJWT){
       return res.status(401).send({message: 'Unauthorized Access'});
    }
    const token = authJWT.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
           return res.status(403).send({message: 'Forbidden Access'})
        }
        req.decoded = decoded;
        next();
    })
}


//CRUD Operation
async function run(){
    try{
        const serviceCollection = client.db('travelGuardian').collection('travelArea');
        const reviewCollection = client.db('travelGuardian').collection('userReview');

        app.get('/services', async(req, res) =>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })

        app.get('/more-services', async(req, res) =>{
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

        app.post('/services', async(req, res) =>{
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })


        //Users Review
        app.post('/userReview', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/displayReview', verifyJWT,  async(req, res) =>{
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'Forbidden access'})
            }

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

        app.get('/displayReviews',  async(req, res) =>{
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

        //JWT token
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'});
            res.send({token})
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