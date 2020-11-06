const express = require("express");
const bodyParser = require("body-parser");
const assert = require("assert");
const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@${process.env.MONGOURL}?retryWrites=true&w=majority`;
const MongoClient = require("mongodb").MongoClient;

const app = express();
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
async function run(limit) {
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }).catch((err) => {
    console.log(err);
  });

  if (!client) {
    return;
  }

  console.log("MongoClient Succesfully Connected...");
  const collection = client.db("dream").collection("crawls");
  const query = { createdAt: { $exists: true } };

  const result = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  client.close();
  console.log(`MongoClient Closed :: We've got ${result.length} items`);
  return result;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/list", (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 100;
  run(limit)
    .then((d) => res.json(d))
    .catch(console.dir);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("listening 3000");
});
