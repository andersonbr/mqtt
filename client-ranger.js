var mqtt = require('./MQTTObject.js');

mqtt({
	desc: "Ventilador",
	place: "Minha Casa",
	floor: "Térreo",
	ambient: "Quarto",
	type: "Ventilator",
	ops: {
		"potenciometro1": {
			"desc": "Potência da ventilação",
			"type": "ranger",
			"min": 0,
			"max": 3,
			"step": 1,
			"current": 0
		}
	}
});