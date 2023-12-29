// all necessary imports
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bp = require('body-parser');
const dns = require('dns');
const dnsOptions = {all: true};

// connect to db
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log('database connected.')
}).catch((err) => console.log(err.message));

// define schema to store url mappings
const Schema = mongoose.Schema;

const urlSchema = new Schema ({
  originalUrl: {type: String, required: true},
  shortUrl: {type: Number}
});

// automatically assign short urls numerically
urlSchema.plugin(AutoIncrement, {id: "urlId", inc_field: 'shortUrl'});

// assign schema and create model
const Url = mongoose.model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// serve static html page
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// extract data encoded in url
app.use(express.urlencoded({
  limit: '10mb',
  extended: true
}));

// Used this arrays to store the passed URLs
const originalURLs = [];
const shortURLs = [];

// URL Shortener API endpoint
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  // REGEX for checking if the passed URL is of correct format or not
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  if (!pattern.test(url)) return res.json({ error: 'invalid url' });

  // Finding the index of the passed URL in originalURLs array
  const foundIndex = originalURLs.indexOf(url);

  // If passed URL is not found in the originalURLs array
  if (foundIndex < 0) {
    originalURLs.push(url);
    shortURLs.push(shortURLs.length);

    return res.json({
      original_url: url,
      short_url: shortURLs.length - 1 // After pushing the shorlURLs in Line 49 the length is incremented, so we get short_url value as shortURLs's length - 1
    });
  }

  // If passed URL is in the originalURLs array
  return res.json({
    original_url: url,
    short_url: shortURLs[foundIndex] // Get the passed url index and assign the short_url to shortURLs array at index of passed url
  });
});

// Shortened URL's original URL access API endpoint
app.get("/api/shorturl/:value", (req, res) => {
  const shortenedURL = Number(req.params.value);
  if (Number.isNaN(shortenedURL)) return res.json({ "error": "Wrong format" }); // If the passed shortenedURL is Not-a-Number return "Wrong format" error message

  // Finding the index of the passed shortenedURL in shortURLs array
  const foundIndex = shortURLs.indexOf(shortenedURL);

  // If passed URL is not found in the originalURLs array
  if (foundIndex < 0) return res.json({ "error": "No short URL found for the given input" });

  // If passed URL is in the originalURLs array
  res.redirect(originalURLs[foundIndex]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});