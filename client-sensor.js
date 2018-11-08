var mqtt = require('./MQTTObject.js');

function secsToday() {
	var today = new Date();
	var today_abs = new Date();
	var today_msecs = 0;
	today_abs.setHours(0);
	today_abs.setMinutes(0);
	today_abs.setSeconds(0);
	today_abs.setMilliseconds(0)
	today_msecs = today.getTime() - today_abs.getTime()
	return today_msecs;
}
function temperaturaAgora() {
	return (19+(17 * (1/((Math.abs((secsToday() / 1000 / 60 / 60)-11)+1)/1.113))));
}

mqtt({
	desc: "Sensor de temperatura",
	place: "Minha Casa",
	floor: "Térreo",
	ambient: "Externo",
	type: "Sensor",
	ops: {
		"sensor": {
			"desc": "Temperatura (C)",
			"type": "info",
			"current": temperaturaAgora()
		}
	}
}, {
	timerInterval: 5,
	timerFunc: function(data, cli) {
		data.ops.sensor.current = temperaturaAgora();
		cli.publish('presence', JSON.stringify(data));
	}
});