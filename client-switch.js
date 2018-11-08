var mqtt = require('./MQTTObject.js');

mqtt({
	topic: "eqps",
	desc: "Luz da entrada",
	place: "Minha Casa",
	floor: "Térreo",
	ambient: "Entrada",
	type: "Light",
	ops: {
		"interrupt0": {
			"desc": "Interruptor da porta de entrada",
			"type": "switch",
			"labels": [ "Liga", "Desliga" ],
			"values": [ "on", "off" ],
			"current": "on"
		}
	}
});