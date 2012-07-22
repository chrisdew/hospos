#!/usr/bin/env node
"strict"

var cbackend = require('cbackend')

var express = require('express'),
    fs = require('fs'),
    conf = process.conf = require('./conf'),
    //uuid = require('node-uuid'),
    
    // uncomment the bits below to enable ssl
    // see http://www.barricane.com/2011/11/24/openssl.html
    options = { //key: fs.readFileSync('./privatekey.pem').toString()
                //, cert: fs.readFileSync('./certificate.pem').toString()
              },
    app = express.createServer();//options)
    
    //sio = require('socket.io');

// setup express
app.configure(function(){
  app.set('view engine', 'ejs');
  app.set('views'      , __dirname + '/views'         );
  app.set('partials'   , __dirname + '/views/partials');
  //app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "FIXME: change this to a secret string" }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.dynamicHelpers({
    session: function(req, res) {
      return req.session;
    },
    sessionID: function(req, res) {
      return req.sessionID;
    },
    dqlID: function(req, res) {
      return req.dqlID;
    }
  }
);

// render the page
app.get('/', function(req, res) {  res.render('index', { layout: 'layouts/base',
                        title: 'HosPos'
                        } );
});

// API
app.get('/api/stock/groups/', function(req, res) {
	res.send(cbackend.get_groups());
});
app.get('/api/stock/groups/:prod_grp/subgroups/', function(req, res) {
	res.send(cbackend.get_subgroups(req.params.prod_grp));
});
app.get('/api/stock/groups/:prod_grp/subgroups/:smsgr_id/items/', function(req, res) {
	res.send(cbackend.get_stock_by_group(req.params.prod_grp, req.params.smsgr_id));
});
app.get('/api/stock/groups/:prod_grp/items/', function(req, res) {
	res.send(cbackend.get_stock_by_group(req.params.prod_grp));
});
app.get('/api/stock/barcode/:barcode/', function(req, res) {
	res.send(cbackend.get_stock_by_barcode(req.params.barcode));
});
app.get('/api/stock/search/:query/', function(req, res) {
	res.send(cbackend.get_stock_by_search(req.params.query));
});
app.get('/api/stock/:key1p2/', function(req, res) {
	res.send(cbackend.get_stock_by_key1p2(req.params.key1p2));
});
app.get('/api/till/open/', function(req, res) {
	res.send({till: 'open'});
	console.log('\n******************\nTILL DRAWER OPENED\n******************\n');
});
app.get('/api/card/read/:amount/', function(req, res) {
	console.log('\n************\nREADING CARD\n************\n');
	setTimeout(function() {
		if (Math.floor(Math.random()*3) === 0) {
			res.send({warning: 'Card Declined', amount: 0});
			console.log('\n*************\nCARD DECLINED\n*************\n');			
		} else {
			res.send({cardNo: '1234567890123456', expDate:'0314', amount: req.params.amount});
			console.log('\n*********\nCARD READ\n*********\n');
		}
	}, 3000);
});
app.post('/api/invoice/complete/', function(req, res) {
	console.log('\n******************\nINVOICE COMPLETED\n******************\n');
	console.log(req.body)
});


// start express listening
app.listen(conf.server.port, conf.server.host);
