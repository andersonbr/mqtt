nodeid = "ESP-" .. wifi.sta.getmac():gsub("\:", "")
clientInfo = {
    ["id"] = nodeid,
    ["topic"] = "eqps",
    ["desc"] = "Controlador de tomadas",
    ["place"] = "Apartamento",
    ["floor"] = "Nono andar",
    ["ambient"] = "Quarto",
    ["type"] = "MultiSwitch",
    ["ops"] = {}
}
-- num tomadas
numtomadas = 4
for i=1,numtomadas,1
    do
    label = "tomada" .. i
    -- estado inicial (possibilidade de persistir em memoria permanente)
    estado = "off"
    clientInfo["ops"][label] = {
            ["desc"] = "Tomada "..i,
            ["type"] = "switch",
            ["labels"] = { "Liga", "Desliga" },
            ["values"] = { "on", "off" },
            ["current"] = estado
        }
end

-- funcao de serializacao JSON
info_encode = function(obj) 
    ok, json = pcall(sjson.encode, obj)
    if ok then
      return json
    else
      print("failed to encode!")
      return nil
    end
end

-- setup gpio
-- 1 = D1 = GPIO5
-- https://nodemcu.readthedocs.io/en/master/en/modules/gpio/
gpio.mode(1, gpio.OUTPUT)
gpio.mode(2, gpio.OUTPUT)
gpio.mode(3, gpio.OUTPUT)
gpio.mode(4, gpio.OUTPUT)
gpio.mode(5, gpio.OUTPUT)
gpio.mode(6, gpio.OUTPUT)
gpio.mode(7, gpio.OUTPUT)
gpio.mode(8, gpio.OUTPUT)

m = mqtt.Client(nodeid, 5, "mdcc", "mdcc")
m:lwt("die", '"' .. nodeid .. '"', 0, 0)
--m:on("connect", function(client) print ("connected") end)
m:on("offline", function(client) print ("offline") end)
m:on("message", function(client, topic, data)
  -- imprimir mensagem recebida
  print(topic .. ":" ) 
  if data ~= nil then
    print(data)
  end
  -- tratar acao
  if topic == "whoalive" then
    -- informar dados atuais
    print("Informando dados atuais (presence)")
    msgJSON = info_encode(clientInfo)
    print(msgJSON)
    client:publish("presence",
        msgJSON,
        0,
        0,
        function(client)
            print("presence sent")
        end
    )
  elseif topic == "eqps/" .. nodeid then
    t = sjson.decode(data)
    clientInfo.ops[t.opt].current = t.val
    if t.opt:match("^tomada") then
        mod = string.gsub(t.opt, "^tomada", "")
        pin = tonumber(mod)
        if pin > 0 and pin <= 8 then
          if t.val == "on" then
            gpio.write(pin, gpio.HIGH)
          else
            gpio.write(pin, gpio.LOW)
          end
        end
    end
    client:publish("presence", info_encode(clientInfo), 0, 0, function(client) print("presence sent") end)
  end
end)
function do_mqtt_connect()
    m:connect("www.shellcode.com.br", 1883, 0,
        function(client)
            print("connected mosquitto")
            print("inicializar subscriptions...")
            client:subscribe(
                "eqps/" .. nodeid,
                0,
                function(client)
                    print("subscribe eqps topic")
            end)
            client:subscribe(
                "whoalive",
                0,
                function(client)
                    print("subscribe whoalive")
            end)
            client:publish("presence", info_encode(clientInfo), 0, 0, function(client) print("presence sent") end)
        end,
        handle_mqtt_error)
end
function handle_mqtt_error(client, reason) 
  tmr.create():alarm(10 * 1000, tmr.ALARM_SINGLE, do_mqtt_connect)
end
do_mqtt_connect()

m:close()
