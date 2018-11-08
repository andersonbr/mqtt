var mqtt = require('./MQTTObject.js');

mqtt({
	topic: "eqps",
	desc: "Luz do canto direito",
	place: "Minha Casa",
	floor: "Térreo",
	ambient: "Sala",
	type: "Light",
	ops: {
		"interrupt1": {
			"desc": "Interruptor A",
			"type": "switch",
			"labels": [ "Liga", "Desliga" ],
			"values": [ "on", "off" ],
			"current": "on"
		},
		"interrupt2": {
			"desc": "Interruptor B",
			"type": "switch",
			"labels": [ "Liga", "Desliga" ],
			"values": [ "on", "off" ],
			"current": "on"
		}
	}
});