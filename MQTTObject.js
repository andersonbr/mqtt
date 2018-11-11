const crypto = require('crypto');

function SubPlaceType(cli, info) {
	// inscrever no topico do eqp
	cli.subscribe("ByPlace/" + info.place + "/" + info.floor + "/" + info.ambient + "/" + info.type, function (err) { if (!err) console.log("inscrito ByPlace/..."); })
	cli.subscribe("ByPlace/" + info.place + "/" + info.floor + "/" + info.type, function (err) { if (!err) console.log("inscrito ByPlace/..."); })
	cli.subscribe("ByPlace/" + info.place + "/" + info.type, function (err) { if (!err) console.log("inscrito ByPlace/..."); })
	cli.subscribe("ByType/" + info.type, function (err) { if (!err) console.log("inscrito ByType/..."); })
}

function unSubPlaceType(cli, info) {
	// inscrever no topico do eqp
	cli.unsubscribe("ByPlace/" + info.place + "/" + info.floor + "/" + info.ambient + "/" + info.type, function (err) { if (!err) console.log("assinatura removida ByPlace/..."); })
	cli.unsubscribe("ByPlace/" + info.place + "/" + info.floor + "/" + info.type, function (err) { if (!err) console.log("assinatura removida ByPlace/..."); })
	cli.unsubscribe("ByPlace/" + info.place + "/" + info.type, function (err) { if (!err) console.log("assinatura removida ByPlace/..."); })
	cli.unsubscribe("ByType/" + info.type, function (err) { if (!err) console.log("assinatura removida ByType/..."); })
}

function MQTTObject (info, options) {

	info.id = crypto.createHash('sha1').
		update(JSON.stringify(info)).digest('hex');

	// informando conexao
	console.log("connecting UID: " + info.id);

	// conexao com mosquitto
	let client  = require('./ConexaoMQTT.js')({ topic: "die", payload: JSON.stringify(info.id) })

	// evento conexao
	client.on('connect', function(cli, info, opts) {
		return function () {
			console.log("conectado " + info.id);
			// notificar manager de que esta online
			cli.publish('presence', JSON.stringify(info));
			// inscrever no topico do eqp
			cli.subscribe('eqps/' + info.id, function (err) {})
			cli.subscribe("whoalive", function (err) { if (!err) console.log("inscrito whoalive"); })
			SubPlaceType(cli, info);
			cli.on("message", function (topic, msg) {
				if (topic == "whoalive") {
					cli.publish('presence', JSON.stringify(info));
				} else if (topic == "eqps/" + info.id) {
					var p = JSON.parse(msg.toString());
					var k = p.key;
					if (k == "desc") {
						info["desc"] = p.val;
					} else if (k == "place" || k == "floor" || k == "ambient" || k == "type") {
						unSubPlaceType(cli, info);
						info[k] = p.val;
						SubPlaceType(cli, info)
					} else {
						info.ops[p.opt][k] = p.val
					}
					cli.publish("presence", JSON.stringify(info));
				}
				console.log(`Recebido: [${topic}] ${msg.toString()}`);
			});
			if (opts != null && opts.timerInterval && opts.timerFunc && opts.timerInterval && typeof opts.timerFunc == "function") {
				setInterval(function() {
					opts.timerFunc(info, cli);
				}, 1000 * opts.timerInterval);
			}
		}}(client, info, options));
}

module.exports = MQTTObject


