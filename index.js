const {MongoClient}=require('mongodb')
const {MongoCron}= require('mongodb-cron');
const Mongourl= 'mongodb://localhost:27017';
(async()=>{
const mongo = await MongoClient.connect(Mongourl,{useNewUrlParser:true});
const db= mongo.db('scheduler');
const collection = db.collection('jobs');
const posts=db.collection('posts');
const job = await collection.insert({
    sleepUntil: new Date('2019-03-07,11:57'),
    content: 'This is awesome',
    createdBy : 'Ram',
    onDate: new Date()
  });
const cron = new MongoCron({
    collection, // a collection where jobs are stored
    onStart: async () => console.log('running'),
    onDocument: async (doc) => {
        posts.insertOne({
            postcontent:doc.content,
            creator:doc.createdBy
        })
    }, // triggered on job processing
    onError: async (err) => console.log(err), // triggered on error
  });
   
  cron.start();
})();
