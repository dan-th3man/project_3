const { MongoClient } = require("mongodb");

const uri = "YOUR_CONNECTION_STRING_HERE"; // Replace with your actual MongoDB Atlas URI
const client = new MongoClient(uri);

let db;

async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db("quizApp"); // You can change this DB name
  }
  return db;
}

module.exports = connectToDB;
