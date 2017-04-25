const express = require('express');
const app = express();
const morgan = require('morgan');
const ObjectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');

const connection = require('./connect');

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.get('/puppies:id', (req, res) => {
  const _id = new ObjectId(req.params.id);
  connection.db.collection('puppies')
    .findOne({ _id })
    .then(puppy => {
      if (!puppy) {
        res.status(404).send({ error: 'resource not found' });
      } else {
        console.log(puppy);
        res.send(puppy);
      }
    });
});

app.post('/puppies', (req, res) => {
  connection.db.collection('puppies')
    .insert(req.body)
    .then(response => {
      return response.ops[0];
    })
    .then(savedPuppy => res.send(savedPuppy))
    .catch(err => console.log(err));
});

module.exports = app;








