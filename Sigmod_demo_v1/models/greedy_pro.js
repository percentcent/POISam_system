var max_min = {
  'Price_k': 1498,
  'bedroom':4,
  'bathroom': 4,
  'parking': 4,
  'age_md': 61,
  'income_md': 1491,
  'local_Per': 0.94,
  'English_Per': 0.94,
  'rent_md':1905,
  'sch_rank':576,
  'to_station':44,
  'Time_train':68,
  'Total_Time':86,
  'supermarket':4996,
  'hospital':4988,
  'shopping_center':4988,
  'clinic':4998,
  'Land_size':4960
}
var Heap = require('heap');
var path = require('path');
var file = require('./readFile.js');

var simMetric = [];

exports.showFull = function(bounds,kItem){
  var features = [];
  var candidate = file.getFullSample(bounds,features);
  var num = candidate.length;
  var sample = [];
  if(num > kItem){
   sample = kRandomArr(candidate,kItem);
  }
  else sample = candidate;
  var response ={
    data:sample,
    num:num
  }
  return response;
}

exports.panningWindow = function(bounds,oldBounds,Dset,k,Distance,features){
  var temp = [];
  var candidate = file.getFullSample(bounds,temp);
  var num = candidate.length;
	var D = [];
	D  = Dset;

  var sample = file.panGetSample(bounds,oldBounds,features);
	var selected = greedSelect(sample,k,D,bounds,Distance,features);
	var proList = setRepresentedSet(sample,selected,features);	
	var response ={
		selected:selected,
		proList:proList,
    num:num
	}
	return response;

}

exports.zoomInWindow = function(bounds,Dset,k,Distance,features){
  var temp = [];
  var candidate = file.getFullSample(bounds,temp);
  var num = candidate.length;

	var D = [];
	D  = Dset;
	
  var sample = file.zoomInGetSample(bounds,D,features);
	var selected = greedSelect(sample,k,D,bounds,Distance,features);
	var proList = setRepresentedSet(sample,selected,features);	
	var response ={
		selected:selected,
		proList:proList,
    num:num
	}
	return response;
	}

exports.zoomOutWindow = function(bounds,oldBounds,reserve_C,k,Distance,features){
  var temp = [];
  var candidate = file.getFullSample(bounds,temp);
  var num = candidate.length;

	var sample = [];
	sample = file.zoomOutGetSample(bounds,oldBounds,features);
	for(var i =0; i < reserve_C.length; i++){
		sample.push(reserve_C[i]);
	}
	var D = [];
  var start = Date.now();
	var selected = greedSelect(sample,k,D,bounds,Distance,features);
  var end = Date.now();
    var run_time = end - start;
    console.log("greedy time: ",run_time);
	var proList = setRepresentedSet(sample,selected,features);	
	var response ={
		selected:selected,
		proList:proList,
    num:num
	}
	return response;
	
}

exports.SOSwindow = function(bounds,k,Distance,features){
	var temp = [];
  var candidate = file.getFullSample(bounds,temp);
  var num = candidate.length;
  var sample = [];
	sample = file.SOSgetSample(bounds,features);
	var D = [];

  var start = Date.now();
	var selected = greedSelect(sample,k,D,bounds,Distance,features);
  var end = Date.now();
    var run_time = end - start;
    console.log("greedy time: ",run_time);
	var proList = setRepresentedSet(sample,selected,features);	

	var response ={
		selected:selected,
		proList:proList,
    num:num
	}
	return response;
	
}

function sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax){

  var lat_diff = Math.abs(objectJ.Lat - objectI.Lat);
  var lon_diff = Math.abs(objectJ.Lng - objectI.Lng);
  var sim = 1 - lat_diff/lat_diffMax - lon_diff/lon_diffMax;
  return sim;
  //return 1 - dist_km(a->lat, a->lon, b->lat, b->lon) / window_size;
}

function sim_objects(objectI,objectJ,features){
  var sim_sum = 1;
  var n = features.length;
  if(n == 0){
    var latMax = 0.5;
    var lngMax = 0.85;
    sim_sum = sim_spatial(objectI,objectJ,latMax.lngMax);

  }
  var different;
  for(var i = 0; i < n; i++){
    //var different = (objectI[features[selectedF[i]]] - objectJ[features[selectedF[i]]]) / max_min[selectedF[i]];
    if(features[i] == 'proType')
    {
      if(objectI.features[features[i]] == objectJ.features[features[i]])
            different = 0;
          else
            different = 1;
    }
    else{
      different = (objectI.features[features[i]] - objectJ.features[features[i]]) / max_min[features[i]];
      different = Math.abs(different);
    }
    
    sim_sum -= 1/n * different;

  }
  return sim_sum;
}

function sim_o_S(object,Set,features){
  
  var n = Set.length;
  var maxSim = 0;
  for(var i = 0; i< n; i++){
    var temp = Set[i];

    //var tempSim = sim_objects(object,temp,features);
    var tempSim = simMetric[object.index][temp.index];
    if(tempSim > maxSim)
      maxSim = tempSim;
  }
  return maxSim;
}

function sim_S_O(Set,O,features){
  var num = O.length;
  //o.w set to be the same
  var sum = 0
  for(var i = 0; i<num; i++){
    sum += sim_o_S(O[i],Set,features);
  }
  var avgSim = sum / num;
  return avgSim;
}

function distanceConflict(bounds,a,b,scale){
  var latDist = (bounds[0] - bounds[1]) * scale;
  var lngDist = (bounds[2] - bounds[3]) * scale;
  if(Math.abs(a.Lat-b.Lat) <= latDist || Math.abs(a.Lng-b.Lng) <= lngDist )
    return false;
  else
    return true;
  
}

function initialHeap(O,features){
	var heap = new Heap(function(a, b) {
    return b.sim - a.sim;
	});
	
  var num = O.length;
  for(var i = 0; i < num; i++){
    var tempSet = [];
    tempSet.push(O[i]);
    var simBound = sim_S_O(tempSet,O,features);
    heap.push({index:i,
    	sim:simBound,
    	iter:0});

  }

  return heap;

}

function setRepresentedSet (oldO,NewRepresentSet,features){

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
      //var max = sim_objects(O[i],NewRepresentSet[0],features);
      var max = simMetric[i][NewRepresentSet[0].index];
      var maxIndex = 0;
    for(var j =1; j < NewRepresentSet.length; j++){
      var temp = NewRepresentSet[j];
      //var tempSim = sim_objects(O[i],temp,features);
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

function greedSelect(oldO,k,D,currentBounds,Distance,features){
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
        var similarity = sim_objects(objectI,objectJ,features);
        temp.push(similarity);
      }
      simMetric.push(temp);
    }

	var heapSim = initialHeap(O,features);
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

      var delta = sim_S_O(tempSet,O,features) - sim_S_O(NewRepresentSet,O,features);
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
      if(distanceConflict(currentBounds,selected,t,scale))
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
