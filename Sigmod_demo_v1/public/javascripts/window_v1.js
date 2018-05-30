var currentBounds = [];
var kItem = 20;
var Distance = 4;
var map;
var previousZoomLevel;
var oldBounds = [];
var NewRepresentSet = [];
var heapList = [];

function initMap(){
  $('#deleteButton').css('display','none');
  var slider = document.getElementById("myRange");
  var output = document.getElementById("kItem");
  output.innerHTML = "Value/k:"+slider.value;

	slider.onchange = function() {
 	 output.innerHTML = "Value/k:"+this.value;
 	 kItem = this.value;
  	 SOSWindow();
	}

  var sliderDist = document.getElementById("distRange");
  var outputDist = document.getElementById("Distance");
  outputDist.innerHTML = "Distance:"+sliderDist.value;

  sliderDist.onchange = function() {
  	outputDist.innerHTML = "Distance:"+this.value;
  	Distance = this.value;
  	SOSWindow();
  }
    showFullData();

    setTimeout("SOSWindow()",2000);

    previousZoomLevel = map.getZoom();

    map.addListener('dragstart',function()
    {
      var mapBound = map.getBounds();
    oldBounds[0] = mapBound.getNorthEast().lat();
    oldBounds[1] = mapBound.getSouthWest().lat();
    oldBounds[2] = mapBound.getNorthEast().lng();
    oldBounds[3] = mapBound.getSouthWest().lng();


    });

    map.addListener('dragend',function(){
    	panningWindow();
    });

    map.addListener('zoom_changed',function(){
      var newZoomLevel = map.getZoom();
      if(newZoomLevel < previousZoomLevel)
        zoomOutWindow();
      else
        zoomInWindow();
      previousZoomLevel = newZoomLevel;
    
    });  
}

function showFullData(){
  var mapBound = map.getBounds();
    var bounds = [];
    bounds[0] = mapBound.getNorthEast().lat();
    bounds[1] = mapBound.getSouthWest().lat();
    bounds[2] = mapBound.getNorthEast().lng();
    bounds[3] = mapBound.getSouthWest().lng();
  var jqxhr = $.ajax(
    {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({
    type: 'showFull',
    k: kItem,
    dist: Distance,
    currentBounds: bounds}),
    dataType:'json'
    }).done(function (res) {
    
    d3ShowFull(res.data);
    console.log(res.data,res.num);
    var output = document.getElementById("allTweet");
    output.innerHTML = "Total tweets:"+res.num.toString();

    });
}

function SOSWindow()
{   
    NewRepresentSet = [];
    var mapBound = map.getBounds();
    var bounds = [];
    bounds[0] = mapBound.getNorthEast().lat();
    bounds[1] = mapBound.getSouthWest().lat();
    bounds[2] = mapBound.getNorthEast().lng();
    bounds[3] = mapBound.getSouthWest().lng();
    currentBounds = bounds;
    
    var jqxhr = $.ajax(
    {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({
    type: 'initial',
    k: kItem,
    dist: Distance,
    currentBounds: bounds}),
    dataType:'json'
    }).done(function (res) {
    // data已经被解析为JSON对象了
    var data = res.selected;
    var tweetData = res.tweetList;
    d3Show(data,tweetData);
    NewRepresentSet = data;
    heapList = tweetData;
    console.log(data);
    console.log(tweetData);
    var output = document.getElementById("allTweet");
    output.innerHTML = "Total tweets:"+res.num.toString();

    });    
}


function zoomOutWindow(){
  //SOSWindow();
    var mapBound = map.getBounds();
    var bounds = [];
    bounds[0] = mapBound.getNorthEast().lat();
    bounds[1] = mapBound.getSouthWest().lat();
    bounds[2] = mapBound.getNorthEast().lng();
    bounds[3] = mapBound.getSouthWest().lng();

    var candidate = [];
        for(var i = 0;i < NewRepresentSet.length; i++){
           if(NewRepresentSet[i].lat<bounds[0] && NewRepresentSet[i].lat>bounds[1] && NewRepresentSet[i].lon<bounds[2] && NewRepresentSet[i].lon>bounds[3]){
              candidate.push(NewRepresentSet[i]);
          
         }
       }

    console.log('candidate',candidate);

    var jqxhr = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({type: 'zoomOut',
    k: kItem,
    dist: Distance,
    currentBounds: bounds,
    oldBounds: currentBounds,
    candidate: candidate
    }),
    dataType:'json'
    }).done(function (res) {
    var data = res.selected;
    var tweetData = res.tweetList;
    d3Show(data,tweetData);
    console.log(data);
    NewRepresentSet = data;
    heapList = tweetData;
    var output = document.getElementById("allTweet");
    output.innerHTML = "Total tweets:"+res.num.toString();

    });
    currentBounds = bounds;

}

function zoomInWindow(){
  //SOSWindow();
    var mapBound = map.getBounds();
    var bounds = [];
    bounds[0] = mapBound.getNorthEast().lat();
    bounds[1] = mapBound.getSouthWest().lat();
    bounds[2] = mapBound.getNorthEast().lng();
    bounds[3] = mapBound.getSouthWest().lng();
    currentBounds = bounds;

    var oldPro = [];

    for(var i = 0;i < NewRepresentSet.length; i++){
           if(NewRepresentSet[i].lat<bounds[0] && NewRepresentSet[i].lat>bounds[1] && NewRepresentSet[i].lon<bounds[2] && NewRepresentSet[i].lon>bounds[3]){
              oldPro.push(NewRepresentSet[i]);
          
         }
        }

    console.log('oldPro',oldPro);

    var jqxhr = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({type: 'zoomIn',
    k: kItem,
    dist: Distance,
    currentBounds: bounds,
    oldPro: oldPro
    }),
    dataType:'json'
    }).done(function (res) {
    
    var data = res.selected;
    var tweetData = res.tweetList;
    d3Show(data,tweetData);
    console.log(data);
    NewRepresentSet = data;
    heapList = tweetData;
    var output = document.getElementById("allTweet");
    output.innerHTML = "Total tweets:"+res.num.toString();

    });

}

function panningWindow(){
  	var mapBound = map.getBounds();
    var bounds = [];
    bounds[0] = mapBound.getNorthEast().lat();
    bounds[1] = mapBound.getSouthWest().lat();
    bounds[2] = mapBound.getNorthEast().lng();
    bounds[3] = mapBound.getSouthWest().lng();
    currentBounds = bounds;

    var oldPro = [];

    for(var i = 0;i < NewRepresentSet.length; i++){
      if(NewRepresentSet[i].lat<bounds[0] && NewRepresentSet[i].lat>bounds[1] && NewRepresentSet[i].lon<bounds[2] && NewRepresentSet[i].lon>bounds[3]){
          oldPro.push(NewRepresentSet[i]);
          
      }
    }
    console.log('oldPro',oldPro);


    var jqxhr = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({type: 'panning',
    k: kItem,
    dist: Distance,
    currentBounds: bounds,
    oldBounds:oldBounds,
    oldPro: oldPro
    }),
    dataType:'json'
    }).done(function (res) {
    
    var data = res.selected;
    var tweetData = res.tweetList;
    d3Show(data,tweetData);
    console.log(data);
    NewRepresentSet = data;
    heapList = tweetData;
    var output = document.getElementById("allTweet");
    output.innerHTML = "Total tweets:"+res.num.toString();

    });
}

function selectBaseline(){
  var zoomLevel = map.getZoom();
  //var center = map.getCenter();
  var lat = map.getCenter().lat();
  var lng = map.getCenter().lng();
  var url = 'baseline/'+zoomLevel+'/'+lat+'/'+lng;
  var newWindow = window.open(url,'baseline');

}

