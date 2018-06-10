//var max_min = [48165256,59977,130106,111128,99,448930];
//var max = [48200256,60132,130259,111290,101,449125];
var max;
var min;
var suburbsData;
function initMap(){
	var jqxhr = $.ajax(
    {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({
    type: 'suburb'}),
    dataType:'json',
    }).done(function (res) {
    
    var data = res.selected;
    max = res.maxList;
    min = res.minList;
    suburbsData = res.proList;
    d3Show(data,suburbsData);

    console.log(res);
    });
}

var overlaySet = [];

function colores_google(n) {
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}

function getRadius(num){
	if(num < 500)
		return 13;
	else if(num < 1000)
		return 16;
	else if(num < 2000)
		return 19;
	else if(num < 3000)
		return 22;
	else 
		return 25;
}

function d3Show(data,suburbsData){
        
        //add the container div
        deleteOverlay();
        var overlay = new google.maps.OverlayView();
        overlaySet.push(overlay);
        overlay.onAdd = function(){
            
        var  layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","property");

            //draw each marker
            overlay.draw = function(){
                var projection = this.getProjection(),
                    padding = 30;


                var marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform)
                    .attr("class","marker");  


                    /*
                    marker.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",function(d,i){
                        return getRadius(d.num);
                    })
                    .attr("id", function(d,i){
                      return i;
                    })
                    .attr("stroke",function(d,i){
                        return colores_google(i);
                    })
                    .attr("stroke-opacity",1.0)
                    .attr("stroke-width","2px")
                    .attr("fill",function(d,i){
                        return colores_google(i);

                    })
                    .attr("fill-opacity",0.6)
                    .on("click",function(d,i){
                        showRepresented(d);
                    });
                    */
                var points = [];
                var feature = [];
                var polygon = [];

                for(var i =0; i<data.length;i++){
                  feature[i] =[];
                  var center_x = 30;
                  var center_y =30;
                  var size_of_edge = 25;
                  points[i]="";

                  feature[i].push(data[i].price);
                  feature[i].push(data[i].gp_dist);
                  feature[i].push(data[i].sp_dist);
                  feature[i].push(data[i].hos_dist);
                  feature[i].push(data[i].train_t);
                  feature[i].push(data[i].shop_dist);

                  for(var j=0;j<6;j++){
                    var location;
                  
                    location=0.3+(max[j]-feature[i][j])/(max[j]-min[j])*0.7;

                       
                    var value_location_x = center_x + Math.cos(j * 2 * Math.PI / 6) * size_of_edge * location;
                    var value_location_y = center_y + Math.sin(j * 2 * Math.PI / 6) * size_of_edge * location;
                    points[i]+=value_location_x+","+value_location_y+" ";

                  }

                  
                }

                 var outPoints;
                outPoints ="";

                for (var i = 0; i < 6; i++){
                                  var x_end = Math.cos(i * 2 * Math.PI / 6) * size_of_edge;
                var y_end = Math.sin(i * 2 * Math.PI / 6) * size_of_edge;

                var x = center_x + x_end;
                var y = center_y + y_end;

                  outPoints += x + "," + y + " ";
                }

                marker.append("polygon")
                    .attr("points", outPoints)
                    .attr("stroke", "lightblue")
                    .attr("stroke-width", "1.5px")
                    .attr("stroke-opacity",0.6)
                    .attr("fill","white")
                    .attr("fill-opacity",0.1);

                marker.append("text")
                      .text(function(d,i){
                        return d.name;

                      })
                      .attr("x",5)
                      .attr("y",25)
                      .attr("font-size", 10)
                      .attr("font-family", "simsum")
                      .attr("font-style", "italic");   

                 /*Drawing Axes*/
                for (var i = 0; i < 6; i++) {
                  
                var x_end = Math.cos(i * 2 * Math.PI / 6) * size_of_edge;
                var y_end = Math.sin(i * 2 * Math.PI / 6) * size_of_edge;
                marker.append("line")
                  .attr("x1", center_x)
                  .attr("y1", center_y)
                  .attr("x2", center_x + x_end)
                  .attr("y2", center_y + y_end)
                  .attr("stroke", "lightblue")
                  .attr("stroke-opacity",0.6)
                  .attr("stroke-width", "1.5px");

    
                }
                  
                    marker.append("polygon")
                    .attr("points", function(d,i){
                      return points[i];
                    })
                    .attr("id", function(d,i){
                      return i;
                    })
                    .attr("stroke",function(d,i){
                        return colores_google(i);
                    })
                    .attr("stroke-opacity",1.0)
                    .attr("stroke-width","1px")
                    .attr("fill",function(d,i){
                        return colores_google(i);
                    })
                    .attr("fill-opacity",0.6)
                    .on("click",function(d,i){
                      showSuburbs(i,data,suburbsData);
                    });

                    
                                        
                function transform(d){
                    d = new google.maps.LatLng(d.Lat,d.Lng);
                    d = projection.fromLatLngToDivPixel(d);
                    return d3.select(this)
                        .style("left",(d.x - padding) + "px")
                        .style("top",(d.y - padding) + "px")
                }

            };
        };

        overlay.onRemove = function()
        {
          d3.selectAll(".property")
                    .remove();

        };
        setOverlay(map);
}

function setOverlay(map){
  for(var i = 0; i < overlaySet.length; i++){
    overlaySet[i].setMap(map);
  }
}

function deleteOverlay()
{
  setOverlay(null);
  overlaySet = [];
}

function showSuburbs(i,data,suburbsData){
  $('.alertSub').html('Click the highlighted suburbs to discover more, or click "Suburb" in Navigation Bar to reselect representative suburb.').addClass('alert-success').show().delay(3000).fadeOut();
    
  var newCenter ={
        lat: data[i].Lat,
        lng: data[i].Lng
    }

    map.setCenter(newCenter);
    map.setZoom(12);
  var highlight = data[i];
  var representedSet = suburbsData[i];
  representedSet.push(data[i]);
  var dataindex = representedSet.length-1;
  //console.log(representedSet);
  
  var index = i;
  
  deleteOverlay();
        var overlay = new google.maps.OverlayView();
        overlaySet.push(overlay);
        overlay.onAdd = function(){
            
          var  layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","hidenProperty");

                    //draw each marker
            overlay.draw = function(){
                var projection = this.getProjection(),
                    padding = 30;


                var marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform);

                var points = [];
                var feature = [];
                var polygon = [];

                for(var i =0; i<data.length;i++){
                  feature[i] =[];
                  var center_x = 30;
                  var center_y =30;
                  var size_of_edge = 25;
                  points[i]="";

                  feature[i].push(data[i].price);
                  feature[i].push(data[i].gp_dist);
                  feature[i].push(data[i].sp_dist);
                  feature[i].push(data[i].hos_dist);
                  feature[i].push(data[i].train_t);
                  feature[i].push(data[i].shop_dist);

                  for(var j=0;j<6;j++){
                    var location;
                  
                    location=0.3+(max[j]-feature[i][j])/(max[j]-min[j])*0.7;

                       
                    var value_location_x = center_x + Math.cos(j * 2 * Math.PI / 6) * size_of_edge * location;
                    var value_location_y = center_y + Math.sin(j * 2 * Math.PI / 6) * size_of_edge * location;
                    points[i]+=value_location_x+","+value_location_y+" ";

                  }

                  
                }

                 var outPoints;
                outPoints ="";

                for (var i = 0; i < 6; i++){
                                  var x_end = Math.cos(i * 2 * Math.PI / 6) * size_of_edge;
                var y_end = Math.sin(i * 2 * Math.PI / 6) * size_of_edge;

                var x = center_x + x_end;
                var y = center_y + y_end;

                  outPoints += x + "," + y + " ";
                }

                marker.append("polygon")
                    .attr("points", outPoints)
                    .attr("stroke", "lightblue")
                    .attr("stroke-width", "1.5px")
                    .attr("stroke-opacity",0.6)
                    .attr("fill","white")
                    .attr("fill-opacity",0.1);

                marker.append("text")
                      .text(function(d,i){
                        return d.name;

                      })
                      .attr("x",5)
                      .attr("y",25)
                      .attr("font-size", 10)
                      .attr("font-family", "simsum")
                      .attr("font-style", "italic");   

                 /*Drawing Axes*/
                for (var i = 0; i < 6; i++) {
                  
                var x_end = Math.cos(i * 2 * Math.PI / 6) * size_of_edge;
                var y_end = Math.sin(i * 2 * Math.PI / 6) * size_of_edge;
                marker.append("line")
                  .attr("x1", center_x)
                  .attr("y1", center_y)
                  .attr("x2", center_x + x_end)
                  .attr("y2", center_y + y_end)
                  .attr("stroke", "lightblue")
                  .attr("stroke-opacity",0.6)
                  .attr("stroke-width", "1.5px");

    
                }
                  
                    marker.append("polygon")
                    .attr("points", function(d,i){
                      return points[i];
                    })
                    .attr("id", function(d,i){
                      return i;
                    })
                    .attr("stroke",function(d,i){
                        return colores_google(i);
                    })
                    .attr("stroke-opacity",function(d,i){
                      if(i == index)
                        return 0.7;
                      else
                        return 0.2;
                    })
                    .attr("stroke-width","1px")
                    .attr("fill",function(d,i){
                        return colores_google(i);
                    })
                    .attr("fill-opacity",function(d,i){
                      if(i == index)
                        return 0.7;
                      else
                        return 0.2;
                    })
                    .on("click",function(d,i){
                      if(i == index)
                        showRepresented(d);
                    });                              

                function transform(d){
                    d = new google.maps.LatLng(d.Lat,d.Lng);
                    d = projection.fromLatLngToDivPixel(d);
                    return d3.select(this)
                        .style("left",(d.x - padding) + "px")
                        .style("top",(d.y - padding) + "px")
                }

            };
        };         

        overlay.onRemove = function()
        {
          d3.selectAll(".hidenProperty")
                    .remove();

        };

        var overlayHighlight = new google.maps.OverlayView();
        overlaySet.push(overlayHighlight);
        overlayHighlight.onAdd = function(){
            
            var layerHighlight = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","ShowProperty");

            //draw each marker
            overlayHighlight.draw = function(){
                var projection = this.getProjection(),
                    padding = 30;

                var show = layerHighlight.selectAll("svg")
                    .data(representedSet)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform);
                    

                var r =10;
                var maxIndex = representedSet.length-1;
                show.append("text")
                      .text(function(d,i){
                        if(i != maxIndex)
                        return d.name;
                        else
                          return "";

                      })
                      .attr("x",25)
                      .attr("y",35)
                      .attr("font-size", 10)
                      .attr("font-family", "simsum")
                      .attr("font-style", "italic");  

                show.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",r)
                    .attr("stroke",function(){
                        return colores_google(index);
                    })
                    .attr("stroke-opacity",function(d,i){
                      if(i != dataindex)
                        return 0.6;
                      else
                        return 0;
                    })
                    .attr("stroke-width","2px")
                    .attr("fill",function(d){
                        return colores_google(index);

                    })
                    .attr("fill-opacity",function(d,i){
                      if(i != dataindex)
                        return 0.6;
                      else
                        return 0;
                    })
                    .on("click",function(d){
                        showRepresented(d);
                    });
                    
                    function transform(d){
                    d = new google.maps.LatLng(d.Lat,d.Lng);
                    d = projection.fromLatLngToDivPixel(d);
                    return d3.select(this)
                        .style("left",(d.x - padding) + "px")
                        .style("top",(d.y - padding) + "px")
                }

            };
        };

        overlayHighlight.onRemove = function()
        {
          d3.selectAll(".ShowProperty").remove();

        };
        setOverlay(map);

}

function showRepresented(d){

	var lat = parseFloat(d.Lat);
  var lng = parseFloat(d.Lng);
  var url = 'Suburb_property/'+lat+'/'+lng;
  var newWindow = window.open(url,'Suburb_property');

}


