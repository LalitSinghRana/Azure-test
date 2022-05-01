"use strict";

const express = require('express')
const app = express()
const Gremlin = require('gremlin');
const config = require("./config");
const events = require('events')

const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${config.database}/colls/${config.collection}`, config.primaryKey)

const client = new Gremlin.driver.Client(
    config.endpoint, 
    { 
        authenticator,
        traversalsource : "g",
        rejectUnauthorized : true,
        mimeType : "application/vnd.gremlin-v2.0+json"
    }
);

let ans = 0;

function countVertices()
{
    console.log('Running Count');
    return client.submit("g.V().count()", { }).then(function (result) {
        ans = result._items[0];
        console.log("Result: %s\n", result._items[0]);
    });
}

client.open()
    .then(countVertices)
    .catch((err) => {
        console.error("Error running query...");
        console.error(err)
    }).then((res) => {
        client.close();
        console.log("Finished");
    }).catch((err) => 
        console.error("Fatal error:", err)
    );

let myEmitter = new events.EventEmitter();

myEmitter.on('someEvent', (msg) => {
    console.log(msg);
})


// app.get('/', (req, res) => res.json('Hello World!' + ans))
app.get('/', (req, res) => res.send({
  "Hard coded" : "Hello",
  "Dynamic" : ans,
}))

myEmitter.emit('someEvent', 'this ran!!!!!!!')
app.listen(process.env.PORT || 80)

