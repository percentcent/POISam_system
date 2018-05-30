const kmeans = require('node-kmeans');
function distanceConflict(bounds,a,b,scale){
  var latDist = (bounds[0] - bounds[1]) * scale;
  var lngDist = (bounds[2] - bounds[3]) * scale;
  if(Math.abs(a.lat-b.lat) <= latDist || Math.abs(a.lon-b.lon) <= lngDist )
    return false;
  else
    return true;
  
}


exports.randomSelect = function(arr,length,currentBounds,Distance){
	var arr1 = arr;
	var newArr = [];
    var index;
    var scale = Distance * 0.001;

    for(var i = 0 ; i < length; i++ ){
    	var flag = 1;
    	while(flag){
    		flag = 0;
    		index = parseInt( Math.random() * arr1.length );
        	var num = newArr.length;
        	var selected = arr1[index];
        	for(var k=0; k<num; k++){
        		var t = newArr[k];
        		if(!distanceConflict(currentBounds,selected,t,scale)){
        			flag = 1;
        			break;
        		}        		

        	}

    	}        
        newArr.push( arr1[index] );
        arr1.splice( index, 1 );
    }
    return newArr;
}


exports.maxSumSelect = function(candidate,k,range){
	var lat_min = range[1];
	var lat_max = range[0];
	var lon_min = range[3];
	var lon_max = range[2];
	var lat_diffMax = lat_max - lat_min;
	var lon_diffMax = lon_max - lon_min;
	var sample = candidate;
  var n = candidate.length;

      var sim = [];
    for(var i=0; i<n; i++){
      var temp = [];
      for(var j=0; j<n; j++)
      {
        var objectJ = candidate[j];
        var objectI = candidate[i];
        var similarity = sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax);
        temp.push(similarity);
      }
      sim.push(temp);
    }

	var newArr = [];
	var a;
	var b;
	var min_R = 1;
	while(newArr.length < k){
		a = 0;
		b = 1;
		for(var i=0; i< sample.length; i++)
			for(var j=i+1; j< sample.length; j++){
				var temp_sim = sim[i][j];
				if(temp_sim < min_R){
					min_R = temp_sim;
					a = i;
					b = j;
				}
			}
		newArr.push(sample[a]);
		newArr.push(sample[b]);
		sample.splice( a, 1 );
		sample.splice(b-1,1);
	}

	return newArr;
}

exports.maxMinSelect = function(candidate,k,range){
    var lat_min = range[1];
    var lat_max = range[0];
    var lon_min = range[3];
    var lon_max = range[2];
    var lat_diffMax = lat_max - lat_min;
    var lon_diffMax = lon_max - lon_min;

    var selected = [];
    for(var i=0; i<k; i++){
      selected.push(i);
    }

    var n = candidate.length;
    //var kk = min(n,k);

    var isSelected = [];
    for(var i=0; i<n; i++){
      if(i < k)
        isSelected.push(true);
      else
        isSelected.push(false);

    }

    var sim = [];
    for(var i=0; i<n; i++){
      var temp = [];
      for(var j=0; j<n; j++)
      {
        var objectJ = candidate[j];
        var objectI = candidate[i];
        var similarity = sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax);
        temp.push(similarity);
      }
      sim.push(temp);
    }
    
    var cnt = 0;
    while(true){
      var find = false;
      for(var i = 0; i < k && !find; i++){
        var best = 1;
        var can = -1;
        for(var j = 0; j < n && !find; j++){
          if(isSelected[j])
            continue;

          var preMinDis = 0;
          var curMinDis = 0;
          for(var p = 0; p < k; p++){
            if(p == selected[i]) continue;
            preMinDis = max(preMinDis, sim[selected[p]][selected[i]]);
            curMinDis = max(curMinDis, sim[selected[p]][j]);
          }
          if(curMinDis < preMinDis && curMinDis < best){
            best = curMinDis;
            can = j;
          }
            
        }
        if(can != -1){
          cnt++;
          isSelected[selected[i]] = false;
          isSelected[can] = true;
          selected.splice(i,1);
          selected.push(can);
          find = true;
          break;
        }
      }
      if(!find)
        break;
      if(cnt > 20000)
        break;
    }
    var result = [];
    for(var i=0; i<k; i++){
      result.push(candidate[selected[i]]);
    }

    return result;
}

exports.DisCSelect = function(allObj,k,range){
    var lat_min = range[1];
    var lat_max = range[0];
    var lon_min = range[3];
    var lon_max = range[2];
    var lat_diffMax = lat_max - lat_min;
    var lon_diffMax = lon_max - lon_min;

    var selected = [];
    var n = allObj.length;

    var isSelected = [];
    for(var i=0; i<n; i++){
        isSelected.push(false);

    }

    var sim = [];
    for(var i=0; i<n; i++){
      var temp = [];
      for(var j=0; j<n; j++)
      {
        var objectJ = allObj[j];
        var objectI = allObj[i];
        var similarity = sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax);
        temp.push(similarity);
      }
      sim.push(temp);
    }
    //console.log(sim);


    var candidates = [];

    for(var i=0; i<n; i++){
      //candidates.push(allObj[i]);
      //candidates[i].index = i;
      candidates.push(i);
    }

    var sim_M = 0.9;
    
    while(candidates.length > 0 && selected.length < k){
      var rep = 0;
      var can = -1;
      for(var i=0; i< candidates.length; i++){
        var rep_n = 0;
        for(var t=0; t< candidates.length; t++){
          //if(sim[candidates[i].index][candidates[t].index] > sim_M)
          if(sim[candidates[i]][candidates[t]] > sim_M)
            rep_n++;
        }
        if(rep_n > rep){
          rep = rep_n;
          can = candidates[i];
        }
      }
      if(can != -1){
        selected.push(can);
        var count =0;
        for(var i = candidates.length-1 ; i >= 0; i--)
          //if(sim[candidates[can].index][candidates[i].index] > sim_M)
          if(sim[can][candidates[i]] > sim_M)
          {
            count ++;
            candidates.splice(i,1);
          }
        //console.log(count);
          //if(dist_km(objs[can]->lat, objs[can]->lon, objs[candidates[i]]->lat, objs[candidates[i]]->lon) < dis_r)      
        
      }
    }

    var result = [];
    for(var i=0; i<selected.length; i++){
      result.push(allObj[selected[i]]);
    }

    return result;

}


function countE_dist(a,b){
	var lat_a = a[0];
	var lat_b = b[0];
	var lon_a = a[1];
	var lon_b = b[1];
	var dist = Math.pow((lat_a - lat_b),2) + Math.pow((lon_a - lon_b),2);
	return dist;
}

function sim_spatial(objectI,objectJ,lat_diffMax,lon_diffMax){

	var lat_diff = Math.abs(objectJ.lat - objectI.lat);
	var lon_diff = Math.abs(objectJ.lon - objectI.lon);
	var sim = 1 - lat_diff/lat_diffMax - lon_diff/lon_diffMax;
	return sim;

	//return 1 - dist_km(a->lat, a->lon, b->lat, b->lon) / window_size;
}

function Sampling_select(candidate,k){
	/*
	var epsilon = 0.05;
	var delta = 0.1;
	var t = 1.0 / 2 / epsilon / epsilon * Math.log(2.0 / delta);
	var sampleSize = 1.0 / (1 / t + 1.0 / k);
	*/
	var sampleSize = k / 4;
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

exports.getScore = function(selected,candidate,bounds){
  var sum = 0
  var latdiff = Math.abs(bounds[0]-bounds[1]);
  var lngdiff = Math.abs(bounds[2]-bounds[3]);
  var n = candidate.length;
  for(var i =0; i<candidate.length; i ++){

      var max = sim_spatial(selected[0],candidate[i],latdiff,lngdiff);
      //var maxIndex = 0;
    for(var j =1; j < selected.length; j++){
      var temp = selected[j];
      var tempSim = sim_spatial(temp,candidate[i],latdiff,lngdiff);
      if(tempSim > max){
       max = tempSim;
       //maxIndex = j;

      }
    }
    sum += max;
    //if(NewRepresentSet[maxIndex] != O[i])
     // heapList[maxIndex].push(O[i]);
  }
  var score = (sum/n - 0.5)*2;
  //var score = sum/n;
  return score;

}

function max(a,b)
{
  if(a>b)
    return a;
  else
    return b;
}