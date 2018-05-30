var cellList = [];
var fs = require("fs");
var path = require('path');

function isStringType(val) {
    return typeof val === "string";
}

exports.buildIndex = function (range,w,h)
{
	var lat_min = range[0];
	var lat_max = range[1];
	var lon_min = range[2];
	var lon_max = range[3];
	var lat_diff = (lat_max - lat_min) / w;
	var lon_diff = (lon_max - lon_min) / h;
	for(var j = 0; j < h; j++)
		for(var i = 0; i < w; i++){
				var id = j * w + i;
				var l_min = lat_min + lat_diff * i;
				var l_max = lat_min + lat_diff * (i + 1);
				var lg_min = lon_min + lon_diff * j;
				var lg_max = lon_min + lon_diff * (j + 1);
				var objs = [];
				var cellData = {
					lat_min:l_min,
					lat_max:l_max,
					lon_min:lg_min,
					lon_max:lg_max,
					objs:objs
				}
				cellList.push(cellData);

			}


	var data = fs.readFileSync(path.join(__dirname,'/tweetProcessed_subset.txt'));
	var tweetdata = data.toString();
   	var line = tweetdata.split('\n');
   	var len = line.length;
   	for(var l = 1; l<len; l++){
   		var lineElem = line[l].split('\t');
   		var lat = parseFloat(lineElem[5]);
		var lon = parseFloat(lineElem[6]);
		var tags = lineElem[4];
		var tags_list = [];
		if( isStringType(tags))
			tags_list = tags.split(',');
		else tags_list.push(tags);
		var createTime = lineElem[1];
		var text = lineElem[2];
		var hashtags = lineElem[3];

		if(lat < lat_min || lat > lat_max || lon < lon_min || lon > lon_max){
			//console.log(lat,lon);
			continue;
		}

		if(isNaN(lat) || isNaN(lon))
			continue;

		var tweetData = {
				content:tags_list,
				lat:lat,
				lon:lon,
				time:createTime,
				text:text,
				tags:hashtags
			};
	
		var i = Math.floor((lat - lat_min) / lat_diff);
		if(i >= w) 
			i = w - 1;
		
		var j = Math.floor((lon - lon_min) / lon_diff);
		if(j >= h) 
			j = h - 1;
		var id = j * w + i;
		
		if(id >= cellList.length)
			id = cellList.length - 1;

		cellList[id].objs.push(tweetData);		
   	}

   	var maxEntry = 0;
   	var maxId = 0;
	for(var c =0; c< cellList.length; c++)
			if(cellList[c].objs.length > maxEntry){
				maxEntry = cellList[c].objs.length;
				maxId = c;
			}
	console.log('maxEntry:',maxEntry,maxId);
	//console.log(cellList[376446].lat_min,cellList[376446].lat_max,cellList[376446].lon_min,cellList[376446].lon_max);
}

exports.query = function (bounds,range,w,h){

	var lat_min = range[0];
	var lat_max = range[1];
	var lon_min = range[2];
	var lon_max = range[3];
	var lat_diff = (lat_max - lat_min) / w;
	var lon_diff = (lon_max - lon_min) / h;
	var lat_a = bounds[1];
	var lat_b = bounds[0];
	var lon_a = bounds[3];
	var lon_b = bounds[2];

	var candidate = [];
	for(var i = Math.floor((lat_a-lat_min)/lat_diff); i < w && i <= Math.floor((lat_b-lat_min)/lat_diff); i++)
			for(var j = Math.floor((lon_a-lon_min)/lon_diff); j < h && j <= Math.floor((lon_b-lon_min)/lon_diff); j++){
				var id = j * w + i;
				for(var t = 0; t < cellList[id].objs.length; t++){
					var obj = cellList[id].objs[t];
					if(obj.lat >= lat_a && obj.lat <= lat_b)
						if(obj.lon >= lon_a && obj.lon <= lon_b)
							candidate.push(obj);
				}
			}
	//console.log(candidate);
	return candidate;

}

exports.queryZoomOut = function(bounds,range,w,h,smallBounds){
	var lat_min = range[0];
	var lat_max = range[1];
	var lon_min = range[2];
	var lon_max = range[3];
	var lat_diff = (lat_max - lat_min) / w;
	var lon_diff = (lon_max - lon_min) / h;
	var lat_a = bounds[1];
	var lat_b = bounds[0];
	var lon_a = bounds[3];
	var lon_b = bounds[2];

	var candidate = [];
	for(var i = Math.floor((lat_a-lat_min)/lat_diff); i < w && i <= Math.floor((lat_b-lat_min)/lat_diff); i++)
			for(var j = Math.floor((lon_a-lon_min)/lon_diff); j < h && j <= Math.floor((lon_b-lon_min)/lon_diff); j++){
				var id = j * w + i;
				for(var t = 0; t < cellList[id].objs.length; t++){
					var obj = cellList[id].objs[t];
					if(obj.lat >= lat_a && obj.lat <= lat_b)
						if(obj.lon >= lon_a && obj.lon <= lon_b)
							if(obj.lat < smallBounds[1] || obj.lat > smallBounds[0] || obj.lon < smallBounds[3] || obj.lon > smallBounds[2])
								candidate.push(obj);
				}
			}
	return candidate;
}

exports.queryZoomIn = function(bounds,range,w,h,oldPro){
	var lat_min = range[0];
	var lat_max = range[1];
	var lon_min = range[2];
	var lon_max = range[3];
	var lat_diff = (lat_max - lat_min) / w;
	var lon_diff = (lon_max - lon_min) / h;
	var lat_a = bounds[1];
	var lat_b = bounds[0];
	var lon_a = bounds[3];
	var lon_b = bounds[2];

	var candidate = [];
	for(var i = Math.floor((lat_a-lat_min)/lat_diff); i < w && i <= Math.floor((lat_b-lat_min)/lat_diff); i++)
			for(var j = Math.floor((lon_a-lon_min)/lon_diff); j < h && j <= Math.floor((lon_b-lon_min)/lon_diff); j++){
				var id = j * w + i;
				for(var t = 0; t < cellList[id].objs.length; t++){
					var obj = cellList[id].objs[t];
					if(obj.lat >= lat_a && obj.lat <= lat_b)
						if(obj.lon >= lon_a && obj.lon <= lon_b){
							for(var pro = 0; pro < oldPro.length; pro++){
								if(obj.lon == oldPro[pro].lon && obj.lat == oldPro[pro].lat)
									break;
							}
							if(pro == oldPro.length)
								candidate.push(obj);
						}
				}
			}

	return candidate;

}

exports.queryPanning = function(bounds,range,w,h,oldBounds){
	var lat_min = range[0];
	var lat_max = range[1];
	var lon_min = range[2];
	var lon_max = range[3];
	var lat_diff = (lat_max - lat_min) / w;
	var lon_diff = (lon_max - lon_min) / h;
	var lat_a = bounds[1];
	var lat_b = bounds[0];
	var lon_a = bounds[3];
	var lon_b = bounds[2];

	var candidate = [];
	for(var i = Math.floor((lat_a-lat_min)/lat_diff); i < w && i <= Math.floor((lat_b-lat_min)/lat_diff); i++)
			for(var j = Math.floor((lon_a-lon_min)/lon_diff); j < h && j <= Math.floor((lon_b-lon_min)/lon_diff); j++){
				var id = j * w + i;
				for(var t = 0; t < cellList[id].objs.length; t++){
					var obj = cellList[id].objs[t];
					if(obj.lat >= lat_a && obj.lat <= lat_b)
						if(obj.lon >= lon_a && obj.lon <= lon_b)				
							if(obj.lat < oldBounds[1] || obj.lat > oldBounds[0] || obj.lon < oldBounds[3] || obj.lon > oldBounds[2])
								candidate.push(obj);
							
				}
			}
	return candidate;

}

