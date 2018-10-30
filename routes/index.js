var Papa = require("fast-csv");
var express = require('express');

var router = express.Router();



//const results = Papa.parse("metro-bike-share-trip-data.csv");
//console.log(results[0]);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Metro Bikeshare' });
  //res.render('index', { results: results});

});



module.exports = router;
