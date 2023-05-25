/* playTimeMarket
playTimeMarket
 */
const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgnllqp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();



        // this collection is used for the  shop by category 
        const toysCollection = client.db('playTimeMarket').collection('toys');

        // this collection is used on the all toys page 
        const addNewToysCollection = client.db('playTimeMarket').collection('addNewToys');

        // getting toys for shop by category
        app.get('/allToys', async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result);

        });

        //getting  all infos for all toys  and   sorting by price

        app.get('/addNewToys', async (req, res) => {
            const { limit = 20, search, sort } = req.query;
            const query = search ? { name: { $regex: search, $options: 'i' } } : {};

            try {
                let sortOption = {};

                if (sort === 'asc') {
                    sortOption = { price: 1 };
                } else if (sort === 'desc') {
                    sortOption = { price: -1 };
                }

                const result = await addNewToysCollection.find(query).limit(parseInt(limit)).sort(sortOption).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error retrieving toys:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        // getting single toy data 
        app.get('/addNewToys/:id', (req, res) => {
            const { id } = req.params;

            addNewToysCollection
                .findOne({ _id: new ObjectId(id) })
                .then((result) => {
                    if (result) {
                        res.send(result);

                    } else {
                        res.status(404).send('Toy not found');
                    }
                })
                .catch((error) => {
                    console.error('Error retrieving toy:', error);
                    res.status(500).send('Internal Server Error');
                });
        });
        // getting single toy data to update
        app.get('/updateToy/:id', (req, res) => {
            const { id } = req.params;
            const query = { _id: new ObjectId(id) }

            addNewToysCollection
                .findOne(query)
                .then((result) => {
                    if (result) {
                        res.send(result);

                    } else {
                        res.status(404).send('Toy not found');
                    }
                })
                .catch((error) => {
                    console.error('Error retrieving toy:', error);
                    res.status(500).send('Internal Server Error');
                });
        });
        // getting user specific data
        app.get('/myToys', async (req, res) => {
            let query = {};

            if (req.query?.seller_email) {
                query = { seller_email: req.query.seller_email }
            }
            const result = await addNewToysCollection.find(query).toArray();
            res.send(result)
        })

        // inserting toys in all toys page

        app.post('/newToy', async (req, res) => {
            const newToy = req.body;
            const result = await addNewToysCollection.insertOne(newToy);
            res.send(result)
            // console.log(toysCollection);
        });


        app.put('/updateToys/:id', async (req, res) => {

            const id = req.params.id;

            const filter = { _id: new ObjectId(id) };
            console.log(filter);
            const options = { upsert: true };
            const updatedToy = req.body;

            const toy = {
                price: updatedToy.price,
                toy_description: updatedToy.toy_description,
                available_quantity: updatedToy.available_quantity
            };

            const result = await addNewToysCollection.updateOne(filter, { $set: toy }, options);
            res.send(result);


        });

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: new ObjectId(id) };
            const result = await addNewToysCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('playTimeMarket is running')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})