var express = require('express');
var router = express.Router();
var url = require('url');
var path = require('path');
var greedyPro = require('../models/greedy_pro.js');
router.use(express.static(path.join(__dirname, 'public')));

router.get('/:lat/:lng',function(req,res,next){

	//res.sendfile('./public/property.html');
	var lat = req.params.lat;
	var lng = req.params.lng;
  	res.render('property',{lat : lat, lng : lng});
});

router.post('/:lat/:lng',function(req,res,next){
	console.log(req.body);
	var request = req.body;
	var bounds = request.currentBounds;
	var k = request.k;
	var Distance = request.dist;
	var type = request.type;
	var features = request.features;
	for(var i =0; i<4;i++)
	{
		bounds[i]=parseFloat(bounds[i]);
	}

	var response = [];

	if(type == 'showFull'){
		response = greedyPro.showFull(bounds,1000);
	}
	
	if(type == 'initial'){
		response = greedyPro.SOSwindow(bounds,k,Distance,features,1);
	}

	if(type == 'zoomOut'){
		var reserve_C = request.candidate;
		var oldBounds = request.oldBounds;
		response = greedyPro.zoomOutWindow(bounds,oldBounds,reserve_C,k,Distance,features);
		
	}

	if(type == 'zoomIn'){
		var D = request.oldPro;
		response = greedyPro.zoomInWindow(bounds,D,k,Distance,features);
		
	}

	if(type == 'panning' ){
		var oldBounds = request.oldBounds;
		var D = request.oldPro;
		response = greedyPro.panningWindow(bounds,oldBounds,D,k,Distance,features);
	}
	
	res.json(response);
});

module.exports = router;
