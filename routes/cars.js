var express = require('express');
var router = express.Router();
// var cars = require('../models/cars');

var monk = require('monk');
var db = monk('localhost:27017/car');

router.get('/', function(req, res) {

	var collection = db.get('cars');
	
	collection.find({}, function(err, cars){
		if (err) throw err;
	  	res.json(cars);
	});
});

router.get('/:id', function(req, res) {
	var collection = db.get('cars');
	collection.findOne({ _id: req.params.id }, function(err, cars){
		if (err) throw err;
	  	res.json(cars);
	});
});

module.exports = router;
