const {MongoMemoryServer} = require('mongodb-memory-server');
const {MongoClient} = require('mongodb');

let database = null;

async function startDatabase(){
    const mongo = new MongoMemoryServer();
    await mongo.start();
    const mongoDBURL = await mongo.getUri();
    const connection = await MongoClient.connect(mongoDBURL, {useNewUrlParser: true});
    database = connection.db();
}

async function getdatabase(){
    if(!database) await startDatabase();
    return database;
}

module.exports = {
    getdatabase,
    startDatabase,
};