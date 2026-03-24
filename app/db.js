const { MongoClient } = require("mongodb");

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { maxPoolSize: 10 });

async function getClient() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client;
}

module.exports = { getClient };
