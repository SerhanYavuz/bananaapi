const {getdatabase} = require('./mongo');
const { ObjectId} = require('mongodb');

const collectionName = 'bananas';

async function insertBanana(banana){
    const database = await getdatabase();
    const{insertedId} = await database.collection(collectionName).insertOne(banana);
    return insertedId;
}

async function getAllBananas(){
    const database = await getdatabase();
    return await database.collection(collectionName).find({}).toArray();
}
async function getBanana(id){
    const database = await getdatabase();
    try{
        var oid = new ObjectId(id);
        return await database.collection(collectionName).findOne({_id: oid});
    }catch(e){
        return({message : 'öyle bi muz bulunamadı'});
    }
    
}
async function updateBanana(id, banana ){
    const database = await getdatabase();
    delete banana._id;
    try{
        await database.collection(collectionName).update(
            {_id: new ObjectId(id),},
            {
                $set:{...banana,},
            },
        );
    }catch(e){
        return({message: 'güncellenemedi !'})
    }

}
module.exports = {
    insertBanana,
    updateBanana,
    getBanana,
    getAllBananas,
};