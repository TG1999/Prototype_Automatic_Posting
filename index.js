const {MongoClient}=require('mongodb')
const {MongoCron}= require('mongodb-cron');
const Mongourl= 'mongodb://localhost:27017';
const express=require('express')
const app=express();
const http=require('http');
const server=http.createServer(app);
const socketio=require('socket.io');
const io=socketio(server);
var spawn = require("child_process").spawn;
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname+'/public'));
app.get('/',(req,res)=>{
  res.sendFile('index.html')
})
app.get('/feed',(req,res)=>{
  MongoClient.connect(Mongourl,{useNewUrlParser:true}).then((mongo)=>{
    const db= mongo.db('scheduler');
    const posts=db.collection('posts');
    posts.find({}).toArray((err,resp)=>{
      res.send(resp)
    })
  })
})
app.post('/schedulepost',(req,res)=>{
(async()=>{
const mongo = await MongoClient.connect(Mongourl,{useNewUrlParser:true});
const db= mongo.db('scheduler');
const collection = db.collection('jobs');
const job = await collection.insertOne({
  sleepUntil: new Date(req.body.date_time),
  autoRemove : true,
  content: req.body.content,
  createdBy : req.body.username,
  onDate: new Date()
});
console.log(job.insertedId);
spawn("python3", ["grammar.py",String(job.insertedId)]);
})();
})

MongoClient.connect(Mongourl,{useNewUrlParser:true}).then((mongo)=>{
  const db= mongo.db('scheduler');
  const collection = db.collection('jobs');
  const posts=db.collection('posts');
  const cron = new MongoCron({
      collection, // a collection where jobs are stored
      onStart: async () => console.log('running'),
      onDocument: async (doc) => {
        console.log('inserted sucessfully')
          posts.insertOne({
              postcontent:doc.content,
              creator:doc.createdBy
          })
      }, // triggered on job processing
      onError: async (err) => console.log(err), // triggered on error
    });
    cron.start();
})
io.on('connection',(socket)=>{
  socket.emit('connected')
  MongoClient.connect(Mongourl,{useNewUrlParser:true}).then((mongo)=>{
    const db= mongo.db('scheduler');
    const posts=db.collection('posts');
    posts.find({}).toArray((err,resp)=>{
      socket.emit('feed',resp)
    })
  })
})
server.listen(2000)
