var Heap = require('heap');
var path = require('path');
var fs = require("fs");

var suburbs = [];
var max = [0,0,0,0,0,0];
var min = [10000000,10000000,10000000,10000000,10000000,10000000];
var max_min_features;

exports.selectSuburb = function(){
	getSuburbData();
	var k =20;
	var selected = greedSelect(k);
	var proList = setRepresentedSet(suburbs,selected);	

	var response ={
		selected:selected,
		proList:proList,
		maxList:max,
		minList:min
	}
	return response;
}

function getSuburbData()
{
	suburbs = [];

	var data = fs.readFileSync(path.join(__dirname,'/suburb.csv'));
	var propertydata = data.toString();
	var line = propertydata.split('\n');
	var len = line.length;
	for(var i =1 ;i<len; i++){
  	var lineElem = line[i].split(',');
  	var name = lineElem[0];
  	var Lat = parseFloat(lineElem[1]);
    var Lng = parseFloat(lineElem[2]);
    var num = parseInt(lineElem[4]);
    var price = parseInt(lineElem[3]);
    var gp_dist = parseInt(lineElem[5]);
    var sp_dist = parseInt(lineElem[6]);
    var hos_dist = parseInt(lineElem[7]);
    var train_t = parseInt(lineElem[8]);
    var shop_dist = parseInt(lineElem[9]);
    if(num > 300 && Lng > 144.7 && Lng < 145.25 && Lat > -38.1 && Lat < -37.5 ){
    	var temp = {
    		name:name,
    		Lat:Lat,
    		Lng:Lng,
    		num:num,
    		price:price,
    		gp_dist:gp_dist,
    		sp_dist:sp_dist,
    		hos_dist:hos_dist,
    		train_t:train_t,
    		shop_dist:shop_dist
    	};
    	suburbs.push(temp);
    	if(price > max[0])
    		max[0] = price;
    	if(price < min[0])
    		min[0] = price;

    	if(gp_dist > max[1])
    		max[1] = gp_dist;
    	if(gp_dist < min[1])
    		min[1] = gp_dist;

    	if(sp_dist > max[2])
    		max[2] = sp_dist;
    	if(sp_dist < min[2])
    		min[2] = sp_dist;

    	if(hos_dist > max[3])
    		max[3] = hos_dist;
    	if(hos_dist < min[3])
    		min[3] = hos_dist;

    	if(train_t > max[4])
    		max[4] = train_t;
    	if(train_t < min[4])
    		min[4] = train_t;

    	if(shop_dist > max[5])
    		max[5] = shop_dist;
    	if(shop_dist < min[5])
    		min[5] = shop_dist;

    }
    
	}
	console.log(suburbs.length);
	max_min_features = {
	price:max[0]-min[0],
	gp_dist:max[1]-min[1],
    sp_dist:max[2]-min[2],
    hos_dist:max[3]-min[3],
    train_t:max[4]-min[4],
    shop_dist:max[5]-min[5]
	};

}

function sim_objects(objectI,objectJ){
  var sim_sum = 1;
  var different;
  different = (objectI.price - objectJ.price)/max_min_features.price;
  different = Math.abs(different);
  sim_sum -= 1/6 * different;
  different = (objectI.gp_dist - objectJ.gp_dist)/max_min_features.gp_dist;
  different = Math.abs(different);
  sim_sum -= 1/6 * different;
  different = (objectI.sp_dist - objectJ.sp_dist)/max_min_features.sp_dist;
  different = Math.abs(different);
  sim_sum -= 1/6 * different;
  different = (objectI.hos_dist - objectJ.hos_dist)/max_min_features.hos_dist;
  different = Math.abs(different);
  sim_sum -= 1/6 * different;
  different = (objectI.train_t - objectJ.train_t)/max_min_features.train_t;
  different = Math.abs(different);
  sim_sum -= 1/6 * different;
  different = (objectI.shop_dist - objectJ.shop_dist)/max_min_features.shop_dist;
  different = Math.abs(different);
  sim_sum -= 1/6 * different;
  return sim_sum;
}

function sim_o_S(object,Set){
  
  var n = Set.length;
  var maxSim = 0;
  for(var i = 0; i< n; i++){
    var temp = Set[i];

    var tempSim = simMetric[object.index][temp.index];
    if(tempSim > maxSim)
      maxSim = tempSim;
  }
  return maxSim;
}

function sim_S_O(Set,O){
  var num = O.length;
  //o.w set to be the same
  var sum = 0
  for(var i = 0; i<num; i++){
    sum += sim_o_S(O[i],Set);
  }
  var avgSim = sum / num;
  return avgSim;
}


function initialHeap(O){
	var heap = new Heap(function(a, b) {
    return b.sim - a.sim;
	});
	
  var num = O.length;
  for(var i = 0; i < num; i++){
    var tempSet = [];
    tempSet.push(O[i]);
    var simBound = sim_S_O(tempSet,O);
    heap.push({index:i,
    	sim:simBound,
    	iter:0});

  }

  return heap;

}

function setRepresentedSet (oldO,NewRepresentSet){

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

function greedSelect(k){
	//O:candidate set

  var O = [];
  for(var i=0; i<suburbs.length; i++){
    O.push(suburbs[i]);
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
        
        var similarity = sim_objects(objectI,objectJ);
        temp.push(similarity);
      }
      simMetric.push(temp);
    }

	var heapSim = initialHeap(O);
  var NewRepresentSet = [];
  
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

      var delta = sim_S_O(tempSet,O) - sim_S_O(NewRepresentSet,O);
      new_t.sim = delta;
      new_t.iter = NewRepresentSet.length;

      heapSim.push(new_t);
      top = heapSim.pop();

    }

    var selected = O[top.index];
    //console.log(top.index);
    NewRepresentSet.push(selected);

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

