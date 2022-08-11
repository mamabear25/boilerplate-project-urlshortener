require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const uri = process.env['DB_URI']

mongoose.connect(uri, {useNewUrlParser: true,useUnifiedTopology: true,})

// set up the schema for url
const schema = new mongoose.Schema({url: 'string'});
const Url = mongoose.model('Url', schema)

app.use(bodyParser.urlencoded({extended: false}))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
console.log(req.body);
const bodyurl = req.body.url;

  // domain name system: standard suite of protocols that comprise TCP/IP
  // calling .hostname sends the url to dns for checkup
const newthing = dns.lookup(urlparser.parse(bodyurl).hostname, (error, address) => {
  // if no address log(invalid url)
  if(!address) {
    res.json({error: 'Invalid URL'})
  } else {
    // else url is saved to the db
    const url = new Url({ url: bodyurl })
    url.save((err, data) => {
      // and sendbk original url plus it's id
      res.json({
        original_url: data.url,
        short_url: data.id
      })
    })
  }
  console.log('dns', error);
  console.log('address', address);
})
console.log('newthing', newthing);
});

// this endpoint takes it the id
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  Url.findById(id,(err, data) => {
    if(!data) {
      // if url is invalid
      res.json({error: 'Invalid URL'})
    } else {
  // if a valid url is found in the database.. redirect to the original url    
    res.redirect(data.url)
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// body-parser is for handling post requests
// express is the node framework we use to build api's
// cors is used for handling cross origin requests

