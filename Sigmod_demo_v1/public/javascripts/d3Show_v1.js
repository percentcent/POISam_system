var overlaySet = [];

function sleep(d){  
  var now = new Date(); 
var exitTime = now.getTime() + d; 
while (true) { 
now = new Date(); 
if (now.getTime() > exitTime) 
return; 
} 
}

function d3ShowFull(data){
    $('.alert').html('Show around 1000 twitters without selection.').addClass('alert-success').show().delay(1900).fadeOut();
    deleteOverlay();
    var overlay = new google.maps.OverlayView();
    overlaySet.push(overlay);

    overlay.onAdd = function(){
        var layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","alltweet");
        overlay.draw = function(){
                var projection = this.getProjection(),
                    padding = 8;

                var marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform);

                var r =4;

                marker.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",4)
                    .attr("stroke","#3366cc")
                    .attr("stroke-opacity",1.0)
                    .attr("stroke-width","2px")
                    .attr("fill","#3366cc")
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
          d3.selectAll(".alltweet")
                    .remove();

        };
        setOverlay(map);

}

function d3Show(data,tweetList){
	deleteOverlay();
	var overlay = new google.maps.OverlayView();
	overlaySet.push(overlay);

	overlay.onAdd = function(){
		var layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","tweet");
        overlay.draw = function(){
                var projection = this.getProjection(),
                    padding = 8;

                var marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform)
                    .attr("class",function(d,i){
                    	
                    	return "t"+i;
                    });

                var r =4;

                marker.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",4)
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
                    .attr("fill-opacity",0.3)
                    .on("click",function(d,i){
                        showRepresented(tweetList,data,i);
                    });

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
          d3.selectAll(".tweet")
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

function showRepresented(tweetList,data,index){
    var tweet = tweetList[index];
    var highlight = data[index];

      deleteOverlay();
        var overlay = new google.maps.OverlayView();
        overlaySet.push(overlay);
        overlay.onAdd = function(){
            
          var  layer = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","hiddenTweet");

            overlay.draw = function(){
                var projection = this.getProjection(),
                    padding = 8;


                var marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform)
                    .enter()
                    .append("svg")
                    .each(transform)
                    .attr("class","hidden");  


                    marker.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",4)
                    .attr("id", function(d,i){
                      return i;
                    })
                    .attr("stroke",function(d,i){
                        if(i != index)
                            return "#3366cc";
                        else 
                          return "red";

                    })
                    .attr("stroke-opacity",1.0)
                    .attr("stroke-width","2px")
                    .attr("fill",function(d,i){
                        
                        if(i != index)
                            return "#3366cc";
                        else 
                          return "red";
                    })
                    .attr("fill-opacity",function(d,i){
                        if(i != index)
                            return 0.3;
                        else 
                          return 1.0;

                    });

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
          d3.selectAll(".hidden")
                    .remove();

        };

        var overlayHighlight = new google.maps.OverlayView();
        overlaySet.push(overlayHighlight);
        overlayHighlight.onAdd = function(){
            
            var layerHighlight = d3.select(this.getPanes().overlayMouseTarget)
                .append("div")
                .attr("class","ShowTweet");

            //draw each marker
            overlayHighlight.draw = function(){
                var projection = this.getProjection(),
                    padding = 8;

                var show = layerHighlight.selectAll("svg")
                    .data(tweet)
                    //.each(transform)
                    .enter()
                    .append("svg")
                    .each(transform)
                    .attr("class","show");         

                var r =4;
                var max = tweet.length-1;

                show.append("circle")
                    .attr("cx",padding)
                    .attr("cy",padding)
                    .attr("r",4)
                    .attr("stroke","#dd4477")
                    .attr("stroke-opacity",1.0)
                    .attr("stroke-width","2px")
                    .attr("fill","#dd4477")
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

        overlayHighlight.onRemove = function()
        {
          d3.selectAll(".show").remove();

        };
        setOverlay(map);

    createTable(tweet,highlight);
    var tweet_list = '';
    for(var i = 0;i<tweet.length; i++){
        var content = tweet[i].content;
        for(var j=0; j<content.length; j++){
            tweet_list += content[j] + ',';
        }
        //tweet_list += tweet[i].content;
    }
    for(var j=0; j<highlight.content.length; j++){
            tweet_list += highlight.content[j] + ',';
        }
    //tweet_list += highlight.content;
    showSimList(tweet_list);
    console.log(tweetList[index]);
    
}

function showSimList(tweet_list){
          
  $('.representList').css({'width':'30%','height':'100%'});
  $('#map').css({'width':'70%','margin-left':'0px'});
  $('#selectBox').css({'width':'0px'});
  $('.slidecontainer').css('display','none');  
  $('#baseline').css('display','none');
  $('#allTweet').css('display','none');
  $('#deleteButton').css('display','block');
  var text_string = tweet_list;
  drawWordCloud(text_string);
  //drawWordCloud();
}

function hiddenSimList(){
  $('.representList').css({'width':'0px'});
  $('#map').css({'width':'80%','margin-left':'20%'});
  $('#selectBox').css({'width':'20%'});
  $('#deleteButton').css('display','none');
  $('.slidecontainer').css('display','block');  
  $('#baseline').css('display','block');
  $('#allTweet').css('display','block');
  d3Show(NewRepresentSet,heapList);
  
}

function sim_objects(objectI,objectJ){
  var sim_sum = 0;
  var i_content = objectI.content;
  var i_length = i_content.length;
  var j_content = objectJ.content;
  var j_length = j_content.length;
  for(var i = 0; i < i_length; i++){
    for(var j = 0; j < j_length; j++){
        if(i_content[i] == j_content[j])
            sim_sum++;
    }
  }
  var sim = sim_sum/(Math.sqrt(i_length)*Math.sqrt(j_length));
  return sim;
}

function createTable(data,target){
    var table_tweet = document.getElementById("table_tweet");
    var childs = table_tweet.childNodes; 
    for(var i = childs.length - 1; i >= 0; i--) {  
    table_tweet.removeChild(childs[i]);  
} 

    //var simTable = [];
    for(var t = 0; t<data.length; t++){
        var sim = sim_objects(data[t],target);
        data[t].sim = sim;
    }

    data.sort(sortRule);

    var table=document.createElement("table");
    table.setAttribute("border","1");
    //table.setAttribute("background","red");

    var line = data.length;
    if(line > 10)
        line = 10;
    var tr1=document.createElement("tr");
    var td1=document.createElement("td");
    var td2=document.createElement("td");
    td1.innerHTML = 'Time';
    td2.innerHTML = 'Twitter';
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    td1.width = '30%';
    td2.width = '70%';
    table.appendChild(tr1);

    var tr2=document.createElement("tr");
    var td3=document.createElement("td");
    var td4=document.createElement("td");
    tr2.style.backgroundColor="lightyellow";
    td3.innerHTML = target.time;
    td4.innerHTML = target.text;
    td3.width = '30%';
    td4.width = '70%';
    tr2.appendChild(td3);
    tr2.appendChild(td4);
    table.appendChild(tr2);

    var list = 2;
    for(var i=0;i < line;i++){

        var tr=document.createElement("tr");
        for(var j=0;j < list;j++){

            var td=document.createElement("td");
            if(j == 0){
                td.innerHTML = data[i].time;
                td.width = '30%';
            }
            else{
                td.innerHTML = data[i].text;
                td.width = '70%';
            }
            tr.appendChild(td);
        }
    table.appendChild(tr);
    }
    document.getElementById("table_tweet").appendChild(table);
}

function sortRule(a,b){
    return b.sim - a.sim;
}

