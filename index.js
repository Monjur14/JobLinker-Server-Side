const express = require("express")
const cors = require("cors")
require("dotenv").config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const PORT = process.env.PORT || 5000
const app = express()

const corsOption = {
    origin: ["http://localhost:5173"],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOption))
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

        //Get all Data from Jobs
        app.get("/jobs", async (req, res) => {
            const result = await jobsCollection.find().toArray()
            res.send(result)
        })

        //Save a data for apply database
        app.post("/apply", async (req, res) => {
          const applyData = req.body
          const result = await appliedCollection.insertOne(applyData)
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