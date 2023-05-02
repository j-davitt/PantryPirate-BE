'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const User = require('./models/user.js');
const List = require('./models/list.js');
const Pantry = require('./models/pantry.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

let productInfo = {};

// AMAZON API
var ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

var defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;

// Credentials 
defaultClient.accessKey = process.env.ACCESS_KEY;
defaultClient.secretKey = process.env.SECRET_KEY;

// Region
defaultClient.host = 'webservices.amazon.com';
defaultClient.region = 'us-east-1';

var api = new ProductAdvertisingAPIv1.DefaultApi();


var searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();


searchItemsRequest['PartnerTag'] = process.env.Partner_Tag;
searchItemsRequest['PartnerType'] = process.env.Partner_Type;

// *** BRING IN MONGOOSE ***
const mongoose = require('mongoose');
// const { request } = require('http');

// *** PER MONGOOSE DOCS PLUG AND PLAY CODE ****
mongoose.connect(process.env.DB_URL);

//mongoose status
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Mongoose is connected');
});

app.post('/user', postUser);
app.get('/user/:name', getUserByEmail);
app.put('/user/:id', updateUser);
app.post('/list', postList);
app.get('/list/:member', getListByMember);
app.put('/list/:id', updateList);
app.delete('/list/:id', deleteList);
app.post('/pantry', postPantry);
app.get('/pantry/:member', getPantryByMember);
app.put('/pantry/:id', updatePantry);
app.delete('/pantry/:id', deletePantry);
app.get('/products/:upc', getProductByUPC);

// API URL https://api.upcitemdb.com/prod/trial/lookup?upc={insert upc here}

async function postUser(request, response, next) {
  try {
    let email = request.body.email;
    let password = request.body.password;
    let foundUser = await User.find({ email: email });
    if (foundUser.length) {
      response.status(200).json(foundUser);
    } else {
      let newUser = await User.create({ email: email, password: password });
      response.status(200).json(newUser);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function updateUser(request, response, next) {
  try {
    let id = request.params.id;
    let data = request.body;

    let updatedUser = await User.findByIdAndUpdate(id, data);
    response.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function postList(request, response, next) {
  try {
    let data = request.body;

    let newList = await List.create(data);
    response.status(200).json(newList);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function updateList(request, response, next) {
  try {
    let id = request.params.id;
    let data = request.body;

    let updatedUser = await List.findByIdAndUpdate(id, data);
    response.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function getUserByEmail(request, response, next) {
  try {
    let email = request.params.email;
    let foundUser = await User.find({ email: email });
    response.status(200).json(foundUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function getListByMember(request, response, next) {
  try {
    let member = request.params.member;
    let foundList = await List.find({ members: member });
    response.status(200).json(foundList);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function deleteList(request, response, next) {
  try {
    let id = request.params.id;
    let deletedList = await List.findByIdAndDelete(id);
    response.status(200).send('List Deleted');
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function postPantry(request, response, next) {
  try {
    let data = request.body;

    let newList = await Pantry.create(data);
    response.status(200).json(newList);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function getPantryByMember(request, response, next) {
  try {
    let member = request.params.member;
    let foundList = await Pantry.find({ members: member });
    response.status(200).json(foundList);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function updatePantry(request, response, next) {
  try {
    let id = request.params.id;
    let data = request.body;

    let updatedUser = await Pantry.findByIdAndUpdate(id, data);
    response.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function deletePantry(request, response, next) {
  try {
    let id = request.params.id;
    let deletedList = await Pantry.findByIdAndDelete(id);
    response.status(200).send('List Deleted');
  } catch (error) {
    console.log(error);
    next(error);
  }
}


async function getProductByUPC(request, res, next) {
  // let url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${request.params.upc}`;
  // let product = await axios.get(url);
  let upc = request.params.upc;
  searchItemsRequest['Keywords'] = upc;

  // Category to Search in. (All when searching by UPC's)
  searchItemsRequest['SearchIndex'] = 'All';

  // Specify the number of items to be returned in search result
  searchItemsRequest['ItemCount'] = 1;

  // Resources requested
  searchItemsRequest['Resources'] = ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price'];


  var callback = function (error, data, response) {
    if (error) {
      console.log('Error calling PA-API 5.0!');
      console.log('Printing Full Error Object:\n' + JSON.stringify(error, null, 1));
      console.log('Status Code: ' + error['status']);
      if (error['response'] !== undefined && error['response']['text'] !== undefined) {
        console.log('Error Object: ' + JSON.stringify(error['response']['text'], null, 1));
      }
    } else {
      console.log('API called successfully.');
      var searchItemsResponse = ProductAdvertisingAPIv1.SearchItemsResponse.constructFromObject(data);
      console.log('Complete Response: \n' + JSON.stringify(searchItemsResponse, null, 1));
      productInfo = searchItemsResponse;

      if (searchItemsResponse['SearchResult'] !== undefined) {
        console.log('Printing First Item Information in SearchResult:');
        var item_0 = searchItemsResponse['SearchResult']['Items'][0];
        if (item_0 !== undefined) {
          if (item_0['ASIN'] !== undefined) {
            console.log('ASIN: ' + item_0['ASIN']);
          }
          if (item_0['DetailPageURL'] !== undefined) {
            console.log('DetailPageURL: ' + item_0['DetailPageURL']);
          }
          if (item_0['ItemInfo'] !== undefined && item_0['ItemInfo']['Title'] !== undefined && item_0['ItemInfo']['Title']['DisplayValue'] !== undefined) {
            console.log('Title: ' + item_0['ItemInfo']['Title']['DisplayValue']);
          }
          if (item_0['Offers'] !== undefined && item_0['Offers']['Listings'] !== undefined && item_0['Offers']['Listings'][0]['Price'] !== undefined && item_0['Offers']['Listings'][0]['Price']['DisplayAmount'] !== undefined) {
            console.log('Buying Price: ' + item_0['Offers']['Listings'][0]['Price']['DisplayAmount']);
          }
        }
      }
      if (searchItemsResponse['Errors'] !== undefined) {
        console.log('Errors:');
        console.log('Complete Error Response: ' + JSON.stringify(searchItemsResponse['Errors'], null, 1));
        console.log('Printing 1st Error:');
        var error_0 = searchItemsResponse['Errors'][0];
        console.log('Error Code: ' + error_0['Code']);
        console.log('Error Message: ' + error_0['Message']);
      }
      console.log('PRODUCT INFO: ' + productInfo);
      res.status(200).json(productInfo);
    }
  };

  try {

    api.searchItems(searchItemsRequest, callback);

  } catch (ex) {
    console.log('Exception: ' + ex);
  }
}

// ENDPOINTS
app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('*', (request, response) => {
  response.status(404).send('Not Available');
});

function start() {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
start();

module.exports = app;
