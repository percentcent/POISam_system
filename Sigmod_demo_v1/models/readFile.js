var fs = require("fs");
var path = require('path');

exports.panGetSample = function(bounds,oldBounds,features){
	var candidate = [];
	var sample = [];

	var data = fs.readFileSync(path.join(__dirname,'/melbourne_vis.csv'));
  var propertydata = data.toString();
  var line = propertydata.split('\n');
  var len = line.length;
  var lineFeature = line[0].split(',');
  var indexList = [];

  for(var i =0; i<features.length;i++){
    var fea = features[i];
    for(var j =0; j<lineFeature.length; j++){
      if(fea == lineFeature[j]){
        indexList.push(j);
        break;
      }
    }
    
  }

  for(var l = 1; l<len; l++){
      var lineElem = line[l].split(',');
    var Lat = parseFloat(lineElem[2]);
    var Lng = parseFloat(lineElem[3]);

    if(Lat < bounds[0] && Lat > bounds[1] && Lng < bounds[2] && Lng > bounds[3]){
    	if(Lat < oldBounds[1] || Lat > oldBounds[0] || Lng < oldBounds[3] || Lng > oldBounds[2])
    {

         var featuresData = new Object();
    for(var i =0; i<features.length;i++){
      var index = indexList[i];
      if(features[i] != 'proType'){
        featuresData[features[i]] = parseFloat(lineElem[indexList[i]]);
      }
      else
        featuresData.proType = lineElem[indexList[i]];
      
    }

    var proData = {
        Lat:Lat,
        Lng:Lng,
        features:featuresData
      }; 

      candidate.push(proData);
    }
	}
      
  }


	console.log("candidate_num",candidate.length);
	if(candidate.length > 1000)
    sample = Sampling_select(candidate,candidate.length);
  	else
    sample = candidate;
  	console.log("sample:",sample.length);
   return sample;

}

exports.zoomInGetSample = function(bounds,oldPro,features){
	var candidate = [];
  	var sample = [];

	var data = fs.readFileSync(path.join(__dirname,'/melbourne_vis.csv'));
  var propertydata = data.toString();
  var line = propertydata.split('\n');
  var len = line.length;
  var lineFeature = line[0].split(',');
  var indexList = [];

  for(var i =0; i<features.length;i++){
    var fea = features[i];
    for(var j =0; j<lineFeature.length; j++){
      if(fea == lineFeature[j]){
        indexList.push(j);
        break;
      }
    }
    
  }

  for(var l = 1; l<len; l++){
      var lineElem = line[l].split(',');
    var Lat = parseFloat(lineElem[2]);
    var Lng = parseFloat(lineElem[3]);

    if(Lat < bounds[0] && Lat > bounds[1] && Lng < bounds[2] && Lng > bounds[3]){
    	for(var pro = 0; pro < oldPro.length; pro++){
			if(Lng == oldPro[pro].Lng && Lat == oldPro[pro].Lat)
				break;
			}
		if(pro == oldPro.length)
		{
         var featuresData = new Object();
         for(var i =0; i<features.length;i++){
      	var index = indexList[i];
      	if(features[i] != 'proType'){
        	featuresData[features[i]] = parseFloat(lineElem[indexList[i]]);
     	 }
      	else
        	featuresData.proType = lineElem[indexList[i]];
      
    	}

    	var proData = {
        	Lat:Lat,
        	Lng:Lng,
        	features:featuresData
      	}; 

      	candidate.push(proData);
		}
    }
      
  }

  console.log("candidate:",candidate.length);
  if(candidate.length > 1000)
    sample = Sampling_select(candidate,candidate.length);
  else
    sample = candidate;
  console.log("sample:",sample.length);
  return sample;

}

exports.zoomOutGetSample = function(bounds,smallBounds,features){
	var candidate = [];
  	var sample = [];

	var data = fs.readFileSync(path.join(__dirname,'/melbourne_vis.csv'));
  var propertydata = data.toString();
  var line = propertydata.split('\n');
  var len = line.length;
  var lineFeature = line[0].split(',');
  var indexList = [];

  for(var i =0; i<features.length;i++){
    var fea = features[i];
    for(var j =0; j<lineFeature.length; j++){
      if(fea == lineFeature[j]){
        indexList.push(j);
        break;
      }
    }
    
  }

  for(var l = 1; l<len; l++){
      var lineElem = line[l].split(',');
    var Lat = parseFloat(lineElem[2]);
    var Lng = parseFloat(lineElem[3]);

    if(Lat < bounds[0] && Lat > bounds[1] && Lng < bounds[2] && Lng > bounds[3])
    {
    	if(Lat < smallBounds[1] || Lat > smallBounds[0] || Lng < smallBounds[3] || Lng > smallBounds[2]){
         var featuresData = new Object();
         for(var i =0; i<features.length;i++){
      	var index = indexList[i];
      	if(features[i] != 'proType'){
        	featuresData[features[i]] = parseFloat(lineElem[indexList[i]]);
      	}
      	else
        	featuresData.proType = lineElem[indexList[i]];
      
   		 }

    	var proData = {
        	Lat:Lat,
        	Lng:Lng,
        	features:featuresData
      	}; 

      	candidate.push(proData);
    	}
    }
      
  }

  console.log("candidate:",candidate.length);
  if(candidate.length > 1000)
    sample = Sampling_select(candidate,candidate.length);
  else
    sample = candidate;
  console.log("sample:",sample.length);
  return sample;
}

exports.SOSgetSample = function(bounds,features){
	var candidate = [];
  	var sample = [];
    candidate = getBoundData(bounds,features);
  console.log("candidate:",candidate.length);
  if(candidate.length > 1000)
    sample = Sampling_select(candidate,candidate.length);
  else
    sample = candidate;
  console.log("sample:",sample.length);
  return sample;
}

exports.getFullSample = function(bounds,features){
  var candidate = [];
    candidate = getBoundData(bounds,features);
    return candidate;
  
}

exports.getData_lat_lon =function(bounds){
  var features = [];
  var candidate = [];
  var boundData = [];
  candidate = getBoundData(bounds,features);
  for(var i =0; i<candidate.length; i++){
    var lon = candidate[i].Lng;
    var lat = candidate[i].Lat;
    var temp = {
      lat:lat,
      lon:lon
    };
    boundData.push(temp);
  }
  return boundData;

}

function getBoundData(bounds,features){
  var candidate = [];
  var data = fs.readFileSync(path.join(__dirname,'/melbourne_vis.csv'));
  var propertydata = data.toString();
  var line = propertydata.split('\n');
  var len = line.length;
  var lineFeature = line[0].split(',');
  var indexList = [];

  for(var i =0; i<features.length;i++){
    var fea = features[i];
    for(var j =0; j<lineFeature.length; j++){
      if(fea == lineFeature[j]){
        indexList.push(j);
        break;
      }
    }
    
  }

  for(var l = 1; l<len; l++){
      var lineElem = line[l].split(',');
    var Lat = parseFloat(lineElem[2]);
    var Lng = parseFloat(lineElem[3]);

    if(Lat < bounds[0] && Lat > bounds[1] && Lng < bounds[2] && Lng > bounds[3]){
         var featuresData = new Object();
    for(var i =0; i<features.length;i++){
      var index = indexList[i];
      if(features[i] != 'proType'){
        featuresData[features[i]] = parseFloat(lineElem[indexList[i]]);
      }
      else
        featuresData.proType = lineElem[indexList[i]];
      
    }

    var proData = {
        Lat:Lat,
        Lng:Lng,
        features:featuresData
      }; 

      candidate.push(proData);
    }
      
  }
  return candidate;
}

function Sampling_select(candidate,k){
	var epsilon = 0.05;
	var delta = 0.1;
	var t = 1.0 / 2 / epsilon / epsilon * Math.log(2.0 / delta);
	var sampleSize = 1.0 / (1 / t + 1.0 / k);
	sampleSize = Math.round(sampleSize);
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