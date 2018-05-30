var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var url = require('url');
var bodyParser = require('body-parser');
var router = express.Router();

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
var RTree = require('./models/spatialTree.js');
var greedy = require('./models/greedy.js');
var greedyPro = require('./models/greedy_pro.js');

var index = require('./routes/index');
var users = require('./routes/users');
var suburb = require('./routes/sub_property');
var app = express();
var fs = require("fs");

// view engine setup
//app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'html');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use(bodyParser.json());

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/

//app.use('/', indexRouter);
var range = [-39.0,-34.0,140.95,149.8];
var w = 1000;
var h =1000;
RTree.buildIndex(range,w,h);


app.get('/',function(req,res){
	res.sendfile('./public/home.html');
});

app.get('/tweet',function(req,res){

	res.sendfile('./public/tweet.html');
});

app.post('/tweet',function(req,res){
	console.log(req.body);
	var request = req.body;
	var bounds = request.currentBounds;
	var k = request.k;
	var Distance = request.dist;
	var type = request.type;
	for(var i =0; i<4;i++)
	{
		bounds[i]=parseFloat(bounds[i]);
	}

	var response = [];

	if(type == 'showFull'){
		response = greedy.showFull(bounds,1000);
	}

	if(type == 'initial'){
		response = greedy.SOSwindow(bounds,k,Distance,1);
	}

	if(type == 'zoomOut'){
		var reserve_C = request.candidate;
		var oldBounds = request.oldBounds;
		response = greedy.zoomOutWindow(bounds,oldBounds,reserve_C,k,Distance);
		
	}

	if(type == 'zoomIn'){
		var D = request.oldPro;
		response = greedy.zoomInWindow(bounds,D,k,Distance);
		
	}

	if(type == 'panning' ){
		var oldBounds = request.oldBounds;
		var D = request.oldPro;
		response = greedy.panningWindow(bounds,oldBounds,D,k,Distance);
	}
	
	res.json(response);
});

app.get('/suburb',function(req,res){
	res.sendfile('./public/suburb.html');
});

app.post('/suburb',function(req,res){
	var response = [];
	var data = fs.readFileSync(path.join(__dirname,'/public/suburb300.csv'));
  	var propertydata = data.toString();
  	var line = propertydata.split('\n');
  	var len = line.length;
  	for(var i =0 ;i<len; i++){
  		var lineElem = line[i].split(',');
  		var name = lineElem[0];
  		var Lat = parseFloat(lineElem[1]);
    	var Lng = parseFloat(lineElem[2]);
    	var num = parseInt(lineElem[3]);
    	var temp = {
    		name:name,
    		Lat:Lat,
    		Lng:Lng,
    		num:num
    	};
    	response.push(temp);
  	}
	res.json(response);
});

app.get('/property',function(req,res){

	res.sendfile('./public/property.html');
	
});

app.post('/property',function(req,res){
	console.log(req.body);
	var request = req.body;
	var bounds = request.currentBounds;
	var k = request.k;
	var Distance = request.dist;
	var type = request.type;
	var features = request.features;
	for(var i =0; i<4;i++)
	{
		bounds[i]=parseFloat(bounds[i]);
	}

	var response = [];

	if(type == 'showFull'){
		response = greedyPro.showFull(bounds,1000);
	}

	if(type == 'initial'){
		response = greedyPro.SOSwindow(bounds,k,Distance,features,1);
	}

	if(type == 'zoomOut'){
		var reserve_C = request.candidate;
		var oldBounds = request.oldBounds;
		response = greedyPro.zoomOutWindow(bounds,oldBounds,reserve_C,k,Distance,features);
		
	}

	if(type == 'zoomIn'){
		var D = request.oldPro;
		response = greedyPro.zoomInWindow(bounds,D,k,Distance,features);
		
	}

	if(type == 'panning' ){
		var oldBounds = request.oldBounds;
		var D = request.oldPro;
		response = greedyPro.panningWindow(bounds,oldBounds,D,k,Distance,features);
	}
	
	res.json(response);
});


app.use('/baseline',index);
app.use('/baseline_RealEstate',users);
app.use('/Suburb_property',suburb);

module.exports = app;

