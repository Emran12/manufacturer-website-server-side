const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const res = require("express/lib/response");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@cluster0.w9iky.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const accessoryCollection = client
      .db("computer-accessories")
      .collection("accessories");
    const orderCollection = client
      .db("computer-accessories")
      .collection("orders");
    const reviewCollection = client
      .db("computer-accessories")
      .collection("reviews");

    app.get("/accessories", async (req, res) => {
      const query = {};
      const cursor = accessoryCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/accessories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await accessoryCollection.findOne(query);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      console.log(`A document was inserted with id ${result.insertedId}`);
    });

    app.put("/accessories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = req.body;
      const prevQnty = data.availableQnty;
      const bookedQnty = data.bookedQnty;
      const updatedData = prevQnty - bookedQnty;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          availableQnty: updatedData,
        },
      };
      const result = await accessoryCollection.updateOne(
        query,
        updateDoc,
        options
      );
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir());

app.get("/", (req, res) => {
  res.send("computer accessories!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
