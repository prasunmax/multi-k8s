const keys = require('./keys');

//Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// postgress client setup

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    port: keys.pgPort,
    database: keys.pgDatabase,
    port: keys.pgPort
});
pgClient.on('error', ()=>console.log('Lost PG connection'));

pgClient.query('create table if not exists values(number INT)').catch(err => console.log(err));

//Redis client setup
const redis = require('redis');
const redisClient  = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// express route handlers

app.get('/', (req,res)=>{
    res.send('Hi');
});

app.get('/values/all', async (req,res)=>{
    const values = await pgClient.query('select * from values');

    res.send(values.rows);
});

app.get('/values/current', async (req,res)=>{
    //Redis library doesnot have promises so we have to use callback
    redisClient.hgetall('values',(err,values)=>{
        res.send(values);
    });
});

app.post('/values', async (req,res)=>{
    const index = req.body.index;
    
    if(parseInt(index) > 40){
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet');
    redisPublisher.publish('insert', index);
    pgClient.query('insert into values(number) VALUES($1)',[index]);
    res.send({working:true});
});
app.listen(5000, err=> {
    console.log("Listening to port 5000");
});