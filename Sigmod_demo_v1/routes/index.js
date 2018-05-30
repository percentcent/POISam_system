
var express = require('express');
var router = express.Router();
var url = require('url');
var Baseline = require('../models/baseline.js');
var RTree = require("../models/spatialTree.js");
var greedy = require("../models/greedy.js");
var kmeans = require('node-kmeans');

var range = [-39.0,-34.0,140.95,149.8];
var w = 1000;
var h =1000;
var Distance = 2.5;

router.get('/:zoom/:lat/:lng', function(req, res, next) {
	var lat = req.params.lat;
	var lng = req.params.lng;
	var zoom = req.params.zoom;
	console.log(lat,lng);
  	res.render('index',{zoom: 15, lat : lat, lng : lng});
});


router.post('/:zoom/:lat/:lng', function(req, res, next) {
	var request = req.body;
	var bounds = request.currentBounds;
	var k = request.k;
	//var Distance = request.dist;
	var type = request.type;
	console.log(req.body);
	for(var i =0; i<4;i++)
	{
		bounds[i]=parseFloat(bounds[i]);
	}
	var result = [];
	if(type == 'initial'){
		
		result = greedy.SOSwindow(bounds,k,Distance,0);
		var start = Date.now();
		var sim_score = getGreedyScore(result.selected,result.tweetList,bounds);
		var end = Date.now();
		var run_time = end - start;
		var send_data ={
			time:run_time,
			score:sim_score,
			objectList:result.selected
		};
		res.json(send_data);
	}
	

	var response_Base = []
	if(type == 'Random'){
		
		var candidate = RTree.query(bounds,range,w,h);
		var start = Date.now();
		response_Base = Baseline.randomSelect(candidate,k,bounds,Distance);
		var sim_score = Baseline.getScore(response_Base,candidate,bounds);
		var end = Date.now();
		var run_time = end - start;
		var send_data ={
			time:run_time,
			score:sim_score,
			objectList:response_Base
		};
		res.json(send_data);
	}

	if(type == 'MaxSum'){
		
		var candidateAll = RTree.query(bounds,range,w,h);
		var length = Math.round(candidateAll.length/4);
		var candidate = kRandomArr( candidateAll, length );

		var start = Date.now();
		response_Base = Baseline.maxSumSelect(candidate,k,bounds);
		var sim_score = Baseline.getScore(response_Base,candidate,bounds);
		var end = Date.now();
		var run_time = end - start;
		var send_data ={
			time:run_time,
			score:sim_score,
			objectList:response_Base
		};
		res.json(send_data);
		
	}
	if(type == 'K-means'){
		
		var candidate = RTree.query(bounds,range,w,h);
		var start = Date.now();
		var sample = candidate;
	var vectors = new Array();
	for(var i = 0; i<sample.length; i++){
		vectors[i] = [sample[i].lat,sample[i].lon];
	}

	
	kmeans.clusterize(vectors,{k:k},(err,response) => {
		var tempResult = [];
  if (err) console.error(err);
  else {
  	var indexO = [];

  	for(var i=0; i<response.length;i++){
  		
  		var tempC = response[i].centroid;

  		var tempList = response[i].cluster;
  		var min = 1000000;
  		var minIndex = 0;
  		for(var j=0; j<tempList.length; j++){
  			var result = countE_dist(tempC,tempList[j]);
  			if(result < min){
  				min = result;
  				minIndex = j;
  			}
  		}
  		indexO.push(tempList[minIndex]);
  	}

  	for(var i = 0; i<indexO.length; i++){
  		var lat = indexO[i][0];
  		var lon = indexO[i][1];
  		var tempO = {
  			lat:lat,
  			lon:lon
  		};
  		tempResult.push(tempO);
  	}

  	var selectedList = []
  	for(var i=0; i<tempResult.length; i++){
  		var temp = [];
  		temp[0] = tempResult[i].lat;
  		temp[1] = tempResult[i].lon;
  		selectedList.push(temp);
  	}
 
		var sim_score = getKmeansScore(response,bounds,selectedList);
		var end = Date.now();
		var run_time = end - start;
		var send_data ={
			time:run_time,
			score:sim_score,
			objectList:tempResult
		};
	res.json(send_data);
  	
  }

	});
	}

	if(type == 'MaxMin'){
		var candidateAll = RTree.query(bounds,range,w,h);
		var length = Math.round(candidateAll.length/30);
		var candidate = kRandomArr( candidateAll, length );

		var start = Date.now();
		response_Base = Baseline.maxMinSelect(candidate,k,bounds);
		var sim_score = Baseline.getScore(response_Base,candidate,bounds);
		var end = Date.now();
		var run_time = end - start;
		var send_data ={
			time:run_time,
			score:sim_score,
			objectList:response_Base
		};
		res.json(send_data);
	}

	if(type == 'DisC'){
		var candidateAll = RTree.query(bounds,range,w,h);
		var length = Math.round(candidateAll.length/4);
		var candidate = kRandomArr( candidateAll, length );

		var start = Date.now();
		response_Base = Baseline.DisCSelect(candidate,k,bounds);
		var sim_score = Baseline.getScore(response_Base,candidate,bounds);
		var end = Date.now();
		var run_time = end - start;
		var send_data ={
			time:run_time,
			score:sim_score,
			objectList:response_Base
		};
		res.json(send_data);

	}
});

function countE_dist(a,b){
	var lat_a = a[0];
	var lat_b = b[0];
	var lon_a = a[1];
	var lon_b = b[1];
	var dist = Math.pow((lat_a - lat_b),2) + Math.pow((lon_a - lon_b),2);
	return dist;
}

function getGreedyScore(selected,list,bounds){
	var sum = 0
	var latdiff = Math.abs(bounds[0]-bounds[1]);
	var lngdiff = Math.abs(bounds[2]-bounds[3]);
	var n = selected.length;
	for(var i = 0; i< selected.length; i++){
		var repList = list[i];
		var rep = selected[i];
		n += repList.length;
		for(var j =0;j < repList.length; j++){
			var obj = repList[j];
			sum += sim_spatial(obj,rep,latdiff,lngdiff);
		}
	}
	sum += selected.length;
	//var score = (sum/n - 0.5)*2;
	var score = sum/n;
	return score;
}

function sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax){

	var lat_diff = Math.abs(objectJ.lat - objectI.lat);
	var lon_diff = Math.abs(objectJ.lon - objectI.lon);
	var sim = 1 - lat_diff/lat_diffMax - lon_diff/lon_diffMax;
	return sim;
	//return 1 - dist_km(a->lat, a->lon, b->lat, b->lon) / window_size;
}

function sim_spatial_array(objectI,objectJ,lat_diffMax,lon_diffMax){

	var lat_diff = Math.abs(objectJ[0] - objectI[0]);
	var lon_diff = Math.abs(objectJ[1] - objectI[1]);
	var sim = 1 - lat_diff/lat_diffMax - lon_diff/lon_diffMax;
	return sim;
	//return 1 - dist_km(a->lat, a->lon, b->lat, b->lon) / window_size;
}

function getKmeansScore(response,bounds,selected){
	var sum = 0
	var latdiff = Math.abs(bounds[0]-bounds[1]);
	var lngdiff = Math.abs(bounds[2]-bounds[3]);
	var n = 0;
	for(var i=0; i<response.length; i++){
		//var centroid = response[i].centroid;
		var centroid = selected[i];
  		var tempList = response[i].cluster;
  		n += tempList.length;
  		for(var j =0 ;j <tempList.length; j++){
  			var obj = tempList[j];
  			sum += sim_spatial_array(obj,centroid,latdiff,lngdiff);
  		}
	}
	var score = (sum/n - 0.5)*2;
	return score;
}

function kRandomArr( arr, length ){
    var newArr = [];
    var index;

    for(var i = 0 ; i < length; i++ ){

        index = parseInt( Math.random() * arr.length );
        newArr.push( arr[index] );
        arr.splice( index, 1 );
    }

    return newArr;
};

module.exports = router;


