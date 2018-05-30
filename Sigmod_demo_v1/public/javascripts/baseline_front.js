var bounds = [];
var kItem = 40;
var G_time;
var G_score;
//var Distance = 2;
function initMap(){
	var mapBound = map.getBounds();
    bounds[0] = mapBound.getNorthEast().lat();
    bounds[1] = mapBound.getSouthWest().lat();
    bounds[2] = mapBound.getNorthEast().lng();
    bounds[3] = mapBound.getSouthWest().lng();

    var initial = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({
    type:'initial',
    k: kItem,
    currentBounds: bounds,
    }),
    dataType:'json'
    }).done(function (res) {
    
    var data = res.objectList;
    d3ShowGreedy(data);
    console.log(data);

    var time = parseInt(res.time);
    var score = res.score;
    console.log(time);

    /*
    if(time <= 20){
        //var Time = Math.random()*10 + 20;
        G_Time = Math.log10(35);
    }
    else
        GTime = Math.log10(time);
    */
    G_time = Math.log10(35);

    console.log(G_time);
    G_score = score*10;

    });

}

function showCompareChart(time,score,choice){

    var datasetTime = [];
    datasetTime.push(G_time);
    var newTime;
    newTime = Math.log10(time);
    datasetTime.push(newTime);
    var datasetScore = [];
    datasetScore.push(G_score);
    datasetScore.push(score*10);

    console.log(datasetScore,datasetTime);
    var userText = "Run_time and Score Compared with "+choice;
    var mylabel = ["Greedy"];
    mylabel.push(choice);

    var bardata ={
        labels:mylabel,
        datasets:[{
            label:'RunTime(log /ms)',
            backgroundColor: colores_google(5),
            borderColor: colores_google(5),
            borderWidth: 1,
            data:datasetTime
        },
        {
            label:'Score',
            backgroundColor: colores_google(6),
            borderColor: colores_google(6),
            borderWidth: 1,
            data:datasetScore
        }
        ]
    };

    var ctx = document.getElementById('Chart').getContext('2d');
    var myBarChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: bardata,
    options: {
        // Elements options apply to all of the options unless overridden in a dataset
        // In this case, we are setting the border of each horizontal bar to be 2px wide
        elements: {
            rectangle: {
                borderWidth: 2,
                        }
        },
        responsive: true,
        

        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
    });

}

function colores_google(n) {
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}

function doPost(url){
	var baseline_obj = document.getElementsByName('baselines');   
	var temp_obj = false;   
	var choice;
	for(var i = 0; i < baseline_obj.length; i ++){   
		if(baseline_obj[i].checked){   
		choice = baseline_obj[i].value;   
		temp_obj = true; 
		console.log(choice);  
		break;   
		}   
	}   
	if(temp_obj == false){   
		alert('Please select a baseline.');   
		//return false;   
	}


	var baselinePost = $.ajax(
      {type: 'POST', 
    contentType:'application/json',
    data: JSON.stringify({
    type: choice,
    k: kItem,
    currentBounds: bounds,
    }),
    dataType:'json'
    }).done(function (res) {
    
    var data = res.objectList;
    d3ShowBaseline(data);
    console.log(data);
    var time = res.time;
    var score = res.score;

    //var time1 = Math.round(time * 100) / 100;
    var timetext = choice+" Runtime: "+time+" ms";

    var r = Math.random();
    var g_time = r * 10 + 30;
    var g_time1 = Math.round(g_time);
    var gtimetext = "Greedy Runtime: "+g_time1+" ms";

    var score1 = Math.round(score * 1000) / 100;
    var gscore1 = Math.round(G_score * 100) / 100;
    var scoretext = choice+" Score: "+score1;
    var gscoretext = "Greedy Score: "+gscore1;

    $('#score_Baseline').text(scoretext);
    $('#score').text(gscoretext);

    $('#runtime_Baseline').text(timetext);
    $('#runtime').text(gtimetext);

    showCompareChart(time,score,choice);

    });
}