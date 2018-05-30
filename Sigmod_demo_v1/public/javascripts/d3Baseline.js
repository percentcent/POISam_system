var overlaySet = [];

function d3ShowBaseline(data){
	deleteOverlay();
	var overlay = new google.maps.OverlayView();
	overlaySet.push(overlay);

	overlay.onAdd = function(){
		var layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","tweetBaseline");
        overlay.draw = function(){
                var projection = this.getProjection(),
                    padding = 6;

                var marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform)
                    .attr("class",function(d,i){
                    	
                    	return "t"+i;
                    });

                var r =3;

                marker.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",3)
                    .attr("stroke",function(d,i){
                    	//if(i>2)
                    		return "#3366cc";
                    	//else 
                    	//	return "#dd4477";
                    })
                    .attr("stroke-opacity",1.0)
                    .attr("stroke-width","2px")
                    .attr("fill",function(d,i){
                    		return "#3366cc";
                    	//else 
                    	//	return "#dd4477";
                    })
                    .attr("fill-opacity",0.3);

                    function transform(d){
                    d = new google.maps.LatLng(d.lat,d.lon);
                    d = projection.fromLatLngToDivPixel(d);
                    return d3.select(this)
                        .style("left",(d.x - padding) + "px")
                        .style("top",(d.y - padding) + "px")
                	}
                };
	};
	
	overlay.onRemove = function()
        {
          d3.selectAll(".tweetBaseline")
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

function d3ShowGreedy(data){
    var overlay = new google.maps.OverlayView();
    overlay.onAdd = function(){
        var layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","tweetGreedy");
        overlay.draw = function(){
                var projection = this.getProjection(),
                    padding = 6;

                var marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform)
                    .attr("class",function(d,i){
                        
                        return "t"+i;
                    });

                var r =3;

                marker.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",3)
                    .attr("stroke",function(d,i){
            
                            return "#fb6a4a";
                    })
                    .attr("stroke-opacity",1.0)
                    .attr("stroke-width","2px")
                    .attr("fill",function(d,i){
                            return "#fb6a4a";
                    })
                    .attr("fill-opacity",0.3);

                    function transform(d){
                    d = new google.maps.LatLng(d.lat,d.lon);
                    d = projection.fromLatLngToDivPixel(d);
                    return d3.select(this)
                        .style("left",(d.x - padding) + "px")
                        .style("top",(d.y - padding) + "px")
                    }
                };
    };
    overlay.setMap(map);

}

