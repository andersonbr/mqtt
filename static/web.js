var objs = {};
var places = {};

var socket = new io({reconnectionAttempts: Infinity});
socket.on("connect", function() {
	socket.emit("whoalive");
});

socket.on('die', function(uid) {
	delete objs[uid];
	cleanObjects();
});

socket.on('presence',function(data) {
	console.log("PRESENCE!");
	if (data != null && data.id) {
		if (!objs[data.id]) {
			objs[data.id] = data
		}
		updateObjects(data);
	}
});

function cleanObjects() {
	// apagar os inexistentes
	$(".obj").each((i,e)=>{
		if (Object.keys(objs).indexOf(e.id) == -1) {
			e.remove();
		}
	})
}

$(function(){
	$("body").on("click", "input.switch", function(ev) {
		var status = this.checked;
		var obj = $(this).data("obj");
		var opt = $(this).data("opt");
		var vl = (status) ?
			objs[obj].ops[opt].values[0] :
			objs[obj].ops[opt].values[1];
		socket.emit("modeqp", {
			id: obj,
			opt: opt,
			key: "current",
			val: vl })
	});
});

function updateObjects(data) {
	console.log(data);
	// limpar
	if ($("#places > .place").length == 0) {
		$("#places").html(null);
	}

	var placeId = sha1(data.place);
	var place = data.place;
	var floorId = sha1(data.floor);
	var floor = data.floor;
	var ambientId = sha1(data.ambient);
	var ambient = data.ambient;
	var typeId = sha1(data.type);
	var type = data.type;
	var objId = data.id;
	var obj = data.desc;

	objs[objId].place = place;
	objs[objId].floor = floor;
	objs[objId].ambient = ambient;
	objs[objId].type = type;

	// criar lugar se nao existir
	var placeDiv = $(`#places > #${placeId}.place`);
	if (placeDiv.length == 0) {
		$("#places").append(`<div id="${placeId}" class="place card text-white bg-dark mb-3"><div class="card-header">Place: ${place}</div><div class="card-body"></div></div>`);
	}
	// criar floor se nao existir
	var floorDiv = $(`#places > #${placeId}.place #${floorId}.floor`);
	if (floorDiv.length == 0) {
		$(`#places > #${placeId}.place > .card-body`).append(`
			<div id="${floorId}" class="floor card text-white bg-info mb-3">
				<div class="card-header">Floor: ${floor}</div>
				<div class="card-body"></div>
			</div>`);
	}

	// criar ambient se nao existir
	var ambientDiv = $(`#places > #${placeId}.place #${floorId}.floor #${ambientId}.ambient`);
	if (ambientDiv.length == 0) {
		$(`#places > #${placeId}.place #${floorId}.floor > .card-body`).append(`
			<div id="${ambientId}" class="ambient card text-white bg-warning mb-3">
				<div class="card-header">Ambient: ${ambient}</div>
				<div class="card-body"></div>
			</div>`);
	}

	// criar objType se nao existir
	var typeDiv = $(`#places > #${placeId}.place #${floorId}.floor #${ambientId}.ambient #${typeId}.objType`);
	if (typeDiv.length == 0) {
		$(`#places > #${placeId}.place #${floorId}.floor #${ambientId}.ambient > .card-body`).append(`
			<div id="${typeId}" class="objType card text-white bg-success mb-3">
				<div class="card-header">Type: ${type}</div>
				<div class="card-body"></div>
			</div>`);
	}

	// criar obj se nao existir
	var objDiv = $(`#places > #${placeId}.place #${floorId}.floor #${ambientId}.ambient #${typeId}.objType #${objId}.obj`);
	if (objDiv.length == 0) {
		$(`#places > #${placeId}.place #${floorId}.floor #${ambientId}.ambient #${typeId}.objType > .card-body`).append(`
			<div id="${objId}" class="obj card text-black bg-light mb-3" style="color: black">
				<div class="card-header">${obj} <small>${objId}</small></div>
				<div class="card-body"></div>
			</div>`);
	}

	// criar botoes de acoes
	$(`#${objId}.obj > .card-body`).html(null);
	Object.keys(data.ops).forEach((optKey,optIdx) => {
		console.log(objId);
		console.log(optKey);
		console.log(data.ops[optKey]);
		var type = data.ops[optKey].type;
		var value = data.ops[optKey].current;
		var desc = data.ops[optKey].desc;
		if (type == "switch") {
			var checked = "";
			if (value == "on") {
				checked = "checked"
			}
			$(`#${objId}.obj > .card-body`).append(`
				<div class="form-group" id="${objId}_${optKey}">
					<span class="switch switch-sm">
					<input type="checkbox" class="switch" id="switch-sm${objId}_${optKey}" ${checked} data-obj="${objId}" data-opt="${optKey}">
					<label for="switch-sm${objId}_${optKey}">${desc}</label>
					</span>
				</div>`);
		} else if (type == "info") {
			$(`#${objId}.obj > .card-body`).append(`${desc}: ${value}`);
		} else if (type == "ranger") {
			var min = data.ops[optKey].min;
			var max = data.ops[optKey].max;
			var step = data.ops[optKey].step;
			$(`#${objId}.obj > .card-body`).append(`
				<input id="slider${objId}_${optKey}" type="text" data-slider-min="${min}" data-slider-max="${max}" data-slider-step="${step}" data-slider-value="${value}" data-obj="${objId}" data-opt="${optKey}" />
				&nbsp; &nbsp;<span>${desc}: <span id="currslider${objId}_${optKey}">${value}</span></span>`);
			$(`#slider${objId}_${optKey}`).slider();
			$(`#slider${objId}_${optKey}`).on("change", function(slideEvt) {
				var obj = $(this).data("obj");
				var opt = $(this).data("opt");
				socket.emit("modeqp", {
					id: obj,
					opt: opt,
					key: "current",
					val: this.value
				})
				$(`#currslider${objId}_${optKey}`).text(this.value);
			});
		}
	});
}

function updateAllObjects() {
	// adicionar/alterar existentes
	Object.keys(objs).forEach((obj,obj_i) => {
		updateObjects(obj);
	})
}
