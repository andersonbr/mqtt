const mqtt = require('mqtt');

function ConexaoMQTT (will) {
	console.log("Will: " + JSON.stringify(will));
	// conexao com mosquitto
	let client  = mqtt.connect('mqtt://shellcode.com.br', {
		keepalive: 5,
		username: 'mdcc',
		password: 'mdcc',
		will: will
	})
	return client;
}

module.exports = ConexaoMQTT