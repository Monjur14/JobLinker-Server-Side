const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const PORT = process.env.PORT || 5000
const app = express()

// const corsOption = {
//     origin: ["http://localhost:5173", "https://assignment-11-3a7d3.web.app"],
//     credentials: true,
//     optionSuccessStatus: 200,
// }
// app.use(cors(corsOption))
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zp5qruk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const jobsCollection = client.db("JobLinker").collection("jobs")
        const appliedCollection = client.db("JobLinker").collection("applied")      
        
        //jwt implement
        app.post("/jwt", async (req, res) => {
          const user = req.body
          console.log(user)
          res.send(user)
        })

        //Get all Data from Jobs
        app.get("/jobs", async (req, res) => {
            const result = await jobsCollection.find().toArray()
            res.send(result)
        })
        app.post('/jobs', async(req, res) => {
          const newItem = req.body;
          const result = await jobsCollection.insertOne(newItem);
          res.send(result)
        })
        ///

        //Save a data for apply database
        app.post("/apply", async (req, res) => {
          const applyData = req.body
          const result = await appliedCollection.insertOne(applyData)
          
          const jobId = applyData.jobId;
            await jobsCollection.updateOne(
                { _id: new ObjectId(jobId) },
                { $inc: { applicants: 1 } }
            );


          res.send(result)
        })

        //Delete Method
        app.delete("/jobs/:id", async(req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id)}
          const result = await jobsCollection.deleteOne(query)
          res.send(result)
        })

        //Update Method
        app.put('/jobs/:id', async(req, res) => {
          const id = req.params.id;
          const filter = {_id: new ObjectId(id)}
          const options = { upsert: true};
          const updatedItem = req.body;
          const SingleItem = {
            $set: {
              bannerUrl: updatedItem.bannerUrl,
              jobTitle: updatedItem.jobTitle,
              loggedInUser: {
                name: updatedItem.loggedInUser.name,
                email: updatedItem.loggedInUser.email
              },
              category: updatedItem.category,
              salaryRange: updatedItem.salaryRange,
              description: updatedItem.description,
              postingDate: updatedItem.postingDate,
              deadline: updatedItem.deadline,
              applicants: updatedItem.applicants,
            }
          }
          const result = await jobsCollection.updateOne(filter, SingleItem, options);
          res.send(result)
        })

        app.get("/apply", async (req, res) => {
          console.log(req.query.email)
          let query = {}
          if(req.query?.email){
            query = {email: req.query.email}
          }
          const result = await appliedCollection.find().toArray();
          res.send(result)
        })



      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
  }
  run().catch(console.dir);

app.get("/", (req, res) => {
    res.send('Hello from JobLinker Server.......')
})


app.listen(PORT, () => {
    console.log(`Server is Running on PORT ${PORT}`)
})