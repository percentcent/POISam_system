var RTree = require('./spatialTree.js');
var range = [-39.0,-34.0,140.95,149.8];
var w = 1000;
var h =1000;
var Heap = require('heap');
var file = require('./readFile.js');

var simMetric = [];

exports.panningWindow = function(bounds,oldBounds,Dset,k,Distance){
  var flag = 1;
	var D = [];
	D  = Dset;
	var candidate = [];
  var alldata = RTree.query(bounds,range,w,h);
  var c_num = alldata.length;
	candidate = RTree.queryPanning(bounds,range,w,h,oldBounds);
	console.log("candidate_num",candidate.length);
	var sample = Sampling_select(candidate,candidate.length);
	console.log("sample",sample.length);

	var selected = greedSelect(sample,k,D,bounds,Distance,flag);
	var tweetList = setRepresentedSet(sample,selected,flag,bounds);	
	var response ={
		selected:selected,
		tweetList:tweetList,
    num:c_num
	}
	return response;

}

exports.zoomInWindow = function(bounds,Dset,k,Distance){
  var flag = 1;
	var D = [];
	D  = Dset;
	var candidate = [];
  var alldata = RTree.query(bounds,range,w,h);
  var c_num = alldata.length;
	candidate = RTree.queryZoomIn(bounds,range,w,h,D);
	console.log("candidate_num",candidate.length);
	var sample = Sampling_select(candidate,candidate.length);
	console.log("sample",sample.length);
	var selected = greedSelect(sample,k,D,bounds,Distance,flag);
	var tweetList = setRepresentedSet(sample,selected,flag,bounds);	
	var response ={
		selected:selected,
		tweetList:tweetList,
    num:c_num
	}
	return response;
	}

exports.zoomOutWindow = function(bounds,oldBounds,reserve_C,k,Distance){
  var flag = 1;
	var candidate = [];
	candidate = RTree.queryZoomOut(bounds,range,w,h,oldBounds);
  var alldata = RTree.query(bounds,range,w,h);
  var c_num = alldata.length;
	for(var i =0; i < reserve_C.length; i++){
		candidate.push(reserve_C[i]);
	}
	console.log("candidate_num",candidate.length);
	var sample = Sampling_select(candidate,candidate.length);
	console.log("sample",sample.length);
	var D = [];
	var selected = greedSelect(sample,k,D,bounds,Distance,flag);
	var tweetList = setRepresentedSet(sample,selected,flag,bounds);	
	var response ={
		selected:selected,
		tweetList:tweetList,
    num:c_num
	}
	return response;
	
}

exports.SOSwindow = function(bounds,k,Distance,flag){
	var candidate = [];
	candidate = RTree.query(bounds,range,w,h);
	console.log('candidate_num',candidate.length);
	var sample = Sampling_select(candidate,candidate.length);
	console.log("sample",sample.length);
	var D = [];
	var selected = greedSelect(sample,k,D,bounds,Distance,flag);
  
	var tweetList = setRepresentedSet(sample,selected,flag,bounds);	

	var response ={
		selected:selected,
		tweetList:tweetList,
    num:candidate.length
	}
	return response;
	
}

exports.showFull = function(bounds,kItem){
  var candidate = [];
  candidate = RTree.query(bounds,range,w,h);
  var num = candidate.length;
  var sample = kRandomArr(candidate,kItem);
  var response ={
    data:sample,
    num:num
  }
  return response;
}

exports.SOSspatial = function(bounds,k,Distance){
  var features = [];
  var sample = [];
  sample = file.SOSgetSample(bounds,features);
  var D = [];
  var t_sample = [];
  for(var i =0 ; i<sample.length; i++){
    var lat = sample[i].Lat;
    var lon = sample[i].Lng;
    var temp = {
      lat:lat,
      lon:lon
    };
    t_sample.push(temp);
  }
  var selected = greedSelect(t_sample,k,D,bounds,Distance,0);
  var proList = setRepresentedSet(t_sample,selected,0,bounds);  

  var response ={
    selected:selected,
    proList:proList
  }
  return response;
}


function Sampling_select(candidate,k){
	var epsilon = 0.05;
	var delta = 0.1;
	var t = 1.0 / 2 / epsilon / epsilon * Math.log(2.0 / delta);
	var sampleSize = 1.0 / (1 / t + 1.0 / k);
	sampleSize = Math.round(sampleSize);
  //if(sampleSize > 200)
  //  sampleSize = 200;
	var sample = kRandomArr(candidate,sampleSize);
	return sample;
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

function sim_objects(objectI,objectJ,flag,bounds){
  var sim;
  var lat_min = bounds[1];
  var lat_max = bounds[0];
  var lon_min = bounds[3];
  var lon_max = bounds[2];
  lat_diffMax = lat_max - lat_min;
  lon_diffMax = lon_max - lon_min;
  if(flag == 0){
  sim = sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax);
  return sim;
  }
  else{
    sim = 0.5*sim_objects_text(objectI,objectJ)+0.5*sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax);
    return sim;
  }

}

function sim_objects_text(objectI,objectJ){
  var sim_sum = 0;
  //var i_content = objectI.content.split(',');
  var i_content = objectI.content;
  var i_length = i_content.length;
  var j_content = objectJ.content;
  var j_length = j_content.length;

/*
 var object_i = {};
  for(var i=0; i<i_length; i++){
    object_i[i_content[i]] = 1;
  }
  for(var j=0;j<j_length;j++){
    if(j_content[j] in object_i)
      sim_sum++;
  }
  */
  /*
  var temp = {};
  for(var i = 0; i<i_length; i++){
    temp[i_content[i]] = 1;
  }
  for(var j = 0; j<j_length; j++){
    if(temp[j_content[j]])
      sim_sum++;
  }
  */
  /*
  for(var i = 0; i < i_length; i++){
  	for(var j = 0; j < j_length; j++){
      if(i_content[i] == j_content[j])
        sim_sum++;
    }
  }
  */
  /*
  for(var j =0 ;j<j_length;j++){
    if(i_content.indexOf(j_content[j]) >= 0)
      sim_sum++;
  }
  */
  //filter ES5
  //var intersect = i_content.filter(function(v){ return j_content.indexOf(v) > -1 });
  //ES7
  var intersect = i_content.filter(v => j_content.includes(v));
  //ES6
  //var j_set = new Set(j_content);
  //var intersect = i_content.filter(x => j_set.has(x));

  sim_sum = intersect.length;
  var sim = sim_sum/(Math.sqrt(i_length)*Math.sqrt(j_length));
  return sim;
}

function sim_o_S(object,Set,flag,bounds){
  
  var n = Set.length;
  var maxSim = 0;
  for(var i = 0; i< n; i++){
    var temp = Set[i];

    //var tempSim = sim_objects(object,temp,flag,bounds);
    var tempSim = simMetric[object.index][temp.index];
    if(tempSim > maxSim)
      maxSim = tempSim;
  }
  return maxSim;
}

function sim_S_O(Set,O,flag,bounds){
  var num = O.length;
  //o.w set to be the same
  var sum = 0
  for(var i = 0; i<num; i++){
    sum += sim_o_S(O[i],Set,flag,bounds);
  }
  var avgSim = sum / num;
  return avgSim;
}

function distanceConflict(bounds,a,b,scale){
  var latDist = (bounds[0] - bounds[1]) * scale;
  var lngDist = (bounds[2] - bounds[3]) * scale;
  if(Math.abs(a.lat-b.lat) <= latDist || Math.abs(a.lon-b.lon) <= lngDist )
    return false;
  else
    return true;
  
}

function initialHeap(O,flag,bounds){
	var heap = new Heap(function(a, b) {
    return b.sim - a.sim;
	});
	
  var num = O.length;
  for(var i = 0; i < num; i++){
    var tempSet = [];
    tempSet.push(O[i]);
    var simBound = sim_S_O(tempSet,O,flag,bounds);
    heap.push({index:i,
    	sim:simBound,
    	iter:0});

  }

  return heap;

}

function setRepresentedSet (oldO,NewRepresentSet,flag,bounds){

  var O = [];
  for(var i=0; i<oldO.length; i++){
    O.push(oldO[i]);
    O[i].index = i;
  }

  var heapList = [];
  for(var k = 0; k<NewRepresentSet.length; k++){
  	var k_set = [];
  	heapList.push(k_set);
  }
  for(var i =0; i<O.length; i ++){
      //var max = sim_objects(O[i],NewRepresentSet[0],flag,bounds);
      var max = simMetric[i][NewRepresentSet[0].index];
      var maxIndex = 0;
    for(var j =1; j < NewRepresentSet.length; j++){
      var temp = NewRepresentSet[j];
      //var tempSim = sim_objects(O[i],temp,flag,bounds);
      var tempSim = simMetric[i][temp.index];
      if(tempSim > max){
       max = tempSim;
       maxIndex = j;

      }
    }
    if(NewRepresentSet[maxIndex] != O[i])
      heapList[maxIndex].push(O[i]);

  }
  return heapList;
}

function greedSelect(oldO,k,D,bounds,Distance,flag){
	//O:candidate set, D:reserved, k, Set:all objects

    var O = [];
  for(var i=0; i<oldO.length; i++){
    O.push(oldO[i]);
    O[i].index = i;
  }

    simMetric = [];
    var n = O.length;
    for(var i=0; i<n; i++){
      var temp = [];
      for(var j=0; j<n; j++)
      {
        var objectJ = O[j];
        var objectI = O[i];
        //var similarity = sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax);
        var similarity = sim_objects(objectI,objectJ,flag,bounds);
        temp.push(similarity);
      }
      simMetric.push(temp);
    }

	var heapSim = initialHeap(O,flag,bounds);
  var NewRepresentSet = [];
  for(var i=0; i<D.length; i++){
  	NewRepresentSet.push(D[i]);
  }
  var heapNum = heapSim.size();
  while(NewRepresentSet.length < k &&  heapNum != 0)
  {

    var top = heapSim.pop();

    while(top.iter != NewRepresentSet.length){
      new_t = top;
      var tempSet = [];
      for(var j =0; j < NewRepresentSet.length; j++){
        tempSet.push(NewRepresentSet[j]);
      }
      tempSet.push(O[new_t.index]);

      var delta = sim_S_O(tempSet,O,flag,bounds) - sim_S_O(NewRepresentSet,O,flag,bounds);
      new_t.sim = delta;
      new_t.iter = NewRepresentSet.length;

      heapSim.push(new_t);
      top = heapSim.pop();

    }

    var selected = O[top.index];
    //console.log(top.index);
    NewRepresentSet.push(selected);

    //console.log(NewRepresentSet);
    var scale = Distance * 0.0025;
    var heapArr = heapSim.toArray();
    var tempHeap = [];

    for(var i =0; i< heapArr.length;i++){
      var index = heapArr[i].index;
      var t = O[index];
      if(distanceConflict(bounds,selected,t,scale))
        tempHeap.push(heapArr[i]);
    }

    heapSim = new Heap(function(a, b) {
    return b.sim - a.sim;
	});

	for(var i =0; i< tempHeap.length; i++)
		heapSim.push(tempHeap[i])
	heapNum = heapSim.size();

  }
  return NewRepresentSet;

 }

 function sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax){

  var lat_diff = Math.abs(objectJ.lat - objectI.lat);
  var lon_diff = Math.abs(objectJ.lon - objectI.lon);
  var sim = 1 - lat_diff/lat_diffMax - lon_diff/lon_diffMax;
  return sim;

  //return 1 - dist_km(a->lat, a->lon, b->lat, b->lon) / window_size;
}

