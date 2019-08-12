const express = require('express');
const bodyParser = require('body-parser');
const imageRoutes = require('./routes/images');
// const redditRoutes = require('./routes/reddit');
// const proxy = require('http-proxy').createProxyServer();


const fs = require('fs');
const app = express();
const https = require('https');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, *'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS, *'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/test', (req, res) => {
  res.status(200).json({test: 'it works!!'});
});

// app.use('/api/reddit', redditRoutes);
app.use('/api/images', imageRoutes);

const port = process.env.PORT || 60000;

app.listen(port);
