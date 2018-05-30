function initMap(){
	var jqxhr = $.ajax(
    {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({
    type: 'suburb'}),
    dataType:'json',
    }).done(function (res) {
    
    var data = res;
    d3Show(data);

    console.log(data);
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

function d3Show(data){
        
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

                    marker.append("text")
                      .text(function(d,i){
                        return d.name;

                      })
                      .attr("x",25)
                      .attr("y",35)
                      .attr("font-size", 10)
                      .attr("font-family", "simsum")
                      .attr("font-style", "italic");   


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


function showRepresented(d){

	var lat = parseFloat(d.Lat);
  var lng = parseFloat(d.Lng);
  var url = 'Suburb_property/'+lat+'/'+lng;
  var newWindow = window.open(url,'Suburb_property');

}


