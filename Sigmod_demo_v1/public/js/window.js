var currentBounds = [];
var kItem = 20;
var Distance = 4;
var map;
var previousZoomLevel;
var oldBounds = [];
var NewRepresentSet = [];
var features = [];
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

function getOneFeatures(select){
  return $(select).val();
}

function getFeatures(){
  var s0 = [];
  var s1 = s0.concat(getOneFeatures('#basic'));
  var s2 = s1.concat(getOneFeatures('#neighbour'));
  var s3 = s2.concat(getOneFeatures('#school'));
  var s4 = s3.concat(getOneFeatures('#travel'));
  var s5 = s4.concat(getOneFeatures('#facility'));
  var s6 = s5.concat(getOneFeatures('#land'));
  
  //console.log(features);
  return s6;
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
    var output = document.getElementById("allProperty");
    output.innerHTML = "Total properties:"+res.num.toString();

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
    var boundData = [];
    features = getFeatures();

    var jqxhr = $.ajax(
    {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({
    type: 'initial',
    k: kItem,
    dist: Distance,
    currentBounds: bounds,
    features:features}),
    dataType:'json',
    }).done(function (res) {
    
    var data = res.selected;
    var proData = res.proList;
    d3Show(data,proData);
    NewRepresentSet = data;
    heapList = proData;
    console.log(data);
    console.log(proData);
    var output = document.getElementById("allProperty");
    output.innerHTML = "Total properties:"+res.num.toString();
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

    features = getFeatures();

        var candidate = [];
        for(var i = 0;i < NewRepresentSet.length; i++){
           if(NewRepresentSet[i].Lat<bounds[0] && NewRepresentSet[i].Lat>bounds[1] && NewRepresentSet[i].Lng<bounds[2] && NewRepresentSet[i].Lng>bounds[3]){
              candidate.push(NewRepresentSet[i]);
          
         }
       }

       var jqxhr = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({type: 'zoomOut',
    k: kItem,
    dist: Distance,
    currentBounds: bounds,
    oldBounds: currentBounds,
    candidate: candidate,
    features:features
    }),
    dataType:'json'
    }).done(function (res) {
    var data = res.selected;
    var proData = res.proList;
    d3Show(data,proData);
    console.log(res);
    NewRepresentSet = data;
    heapList = proData;
    var output = document.getElementById("allProperty");
    output.innerHTML = "Total properties:"+res.num.toString();

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
    features = getFeatures();

    
        var oldPro = [];

        for(var i = 0;i < NewRepresentSet.length; i++){
           if(NewRepresentSet[i].Lat<bounds[0] && NewRepresentSet[i].Lat>bounds[1] && NewRepresentSet[i].Lng<bounds[2] && NewRepresentSet[i].Lng>bounds[3]){
              oldPro.push(NewRepresentSet[i]);
          
         }
        }

        var jqxhr = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({type: 'zoomIn',
    k: kItem,
    dist: Distance,
    currentBounds: bounds,
    oldPro: oldPro,
    features: features
    }),
    dataType:'json'
    }).done(function (res) {
    
    var data = res.selected;
    var proData = res.proList;
    d3Show(data,proData);
    console.log(res);
    NewRepresentSet = data;
    heapList = proData;
    var output = document.getElementById("allProperty");
    output.innerHTML = "Total properties:"+res.num.toString();

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
    features = getFeatures();

    var oldPro = [];

    for(var i = 0;i < NewRepresentSet.length; i++){
      if(NewRepresentSet[i].Lat<bounds[0] && NewRepresentSet[i].Lat>bounds[1] && NewRepresentSet[i].Lng<bounds[2] && NewRepresentSet[i].Lng>bounds[3]){
          oldPro.push(NewRepresentSet[i]);
          
      }
    }

    var jqxhr = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({type: 'panning',
    k: kItem,
    dist: Distance,
    currentBounds: bounds,
    oldBounds:oldBounds,
    oldPro: oldPro,
    features:features
    }),
    dataType:'json'
    }).done(function (res) {
    
    var data = res.selected;
    var proData = res.proList;
    d3Show(data,proData);
    console.log(res);
    NewRepresentSet = data;
    heapList = proData;
    var output = document.getElementById("allProperty");
    output.innerHTML = "Total properties:"+res.num.toString();

    });       
   
}
function selectBaseline(){
  var zoomLevel = map.getZoom();
  //var center = map.getCenter();
  var lat = map.getCenter().lat();
  var lng = map.getCenter().lng();
  var url = '/baseline_RealEstate/'+zoomLevel+'/'+lat+'/'+lng;
  var newWindow = window.open(url,'baseline');

}

