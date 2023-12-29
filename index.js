require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.htmlrequire('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const app = express();
  const mongoose = require('mongoose');
  const AutoIncrement = require('mongoose-sequence')(mongoose);
  const bp = require('body-parser');
  const dns = require('dns');
  const dnsOptions = {all: true};
  
  mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log('database connected.')
  }).catch((err) => console.log(err.message));
  
  const Schema = mongoose.Schema;
  
  const urlSchema = new Schema ({
    originalUrl: {type: String, required: true},
    shortUrl: {type: Number}
  });
  
  urlSchema.plugin(AutoIncrement, {id: "urlId", inc_field: 'shortUrl'});
  
  const Url = mongoose.model("Url", urlSchema);
  
  // Basic Configuration
  const port = process.env.PORT || 3000;
  
  app.use(cors());
  
  app.use('/public', express.static(`${process.cwd()}/public`));
  
  app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });
  
  // Your first API endpoint
  app.get('/api/hello', function(req, res) {
    res.json({ greeting: 'hello API' });
  });
  
  app.use("/api/shorturl", bp.urlencoded({extended: false}));
  app.use(bp.json());
  
  app.post('/api/shorturl', async (req, res) => {
  try {
    const urlOriginal = req.body.url;
    let urlPattern = /^https?:\/\/+/;
    let hostName = urlOriginal.split("/")[2];
    if (urlPattern.test(urlOriginal) == false) {
        res.json({error: "Invalid Url"});
    } else {
      //check whether address exist in db;
        const existingUrl = await Url.findOne({originalUrl: urlOriginal});
        //if exists
        if (existingUrl) {
        //responds with information
       res.json({"original_url": urlOriginal, "short_url": existingUrl.shortUrl, "New url": `https://project-urlshortener.jlio-se.repl.co/api/shorturl/${existingUrl.shortUrl}`});
        } else {
          dns.lookup(hostName, dnsOptions, (err, address) => {
            if (err) { 
             console.log(err);
              res.json({error: "Invalid Hostname"});
            } else {
              let url = new Url (
                {originalUrl: urlOriginal}
              );
  
              url.save((err, saved) => {
                if (err) {return console.log(err);} else {
                res.json({"original_url": urlOriginal, "short_url": saved.shortUrl, "New url": `https://project-urlshortener.jlio-se.repl.co/api/shorturl/${saved.shortUrl}`});
                  };
              });
            }
          });
        };
      } 
  }  catch (err) {
    console.log(err);
    }  
  });
  
  app.get("/api/shorturl/:urlNum", (req, res) => {
    const urlNum = req.params.urlNum;
    Url.findOne({shortUrl: urlNum}, (err, urlFound) => {
      if (err) {
        console.log(err);
      } if (!urlFound) {
        res.json({error: "url not found"});
      } else {
        res.redirect(urlFound.originalUrl);
      };
    });
  });
  
  app.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
