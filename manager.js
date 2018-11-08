const
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	express = require('express'),
	app = express(),
	chttp = http.Server(app),
	io = require('socket.io')(chttp),
	path = require('path');
var mqtt = require('mqtt')

// SOCKET.IO
io.on('connection', function(socket) {
	socket.on("whoalive", function() {
		console.log("publish whoalive no mqtt");
		client.publish("whoalive", "?");
	});
	socket.on("modeqp", function(data) {
		console.log(`publish eqps/${data.id} no mqtt`);
		var msg = {
			opt: data.opt,
			key: data.key,
			val: data.val
		};
		console.log(JSON.stringify(data))
		client.publish(`eqps/${data.id}`, JSON.stringify(msg));
	});
});

// MQTT
var client  = mqtt.connect('mqtt://shellcode.com.br', { username: 'mdcc', password: 'mdcc' })
client.on('connect', function () {
	client.subscribe("presence", function (err) {})
	client.subscribe("die", function (err) {})
	client.subscribe("modstatus", function (err) {})
});
client.on("message", function (topic, msg) {
	console.log("topic: " + topic + ", msg: " + msg.toString());
	// enviar mensagem para socket.io
	io.emit(topic, JSON.parse(msg.toString()));
});

app.use(express.json());

// objetos detectado
var objects = [];

app.post('/pub', function(req, res) {
	var obj = req.body;
	console.log(JSON.stringify(obj));
	res.end("ok");
});

app.get('/list', function(req, res) {
	res.end(JSON.stringify(objects));
});

// controle
app.get('/', function(req, res) {
	 res.sendFile(path.join(__dirname + '/index.html'));
});
var paths = __dirname.split('/');
var staticdir = paths.join('/') + '/static';
app.use('/static', express.static(staticdir));

chttp.listen(3002, function() {
	console.log('listening on *:3002');
});