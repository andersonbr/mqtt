import socket
import threading

head = """HTTP/1.1 200 OK\r
Server: SDRC\r
Content-Type: text/html; charset=utf-8\r
Content-Length: %d\r
Connection: Closed\r
\r
"""

body = """<!DOCTYPE html>
<html>
    <head>
        <title>SDRC</title>
        <meta name="viewport" content="width=device-width, user-scalable=no">
        <script type="text/javascript">
            window.onload = function() {
                document.querySelectorAll(".status_0").forEach((e, i) => {
                    e.innerHTML = "Ligar"
                });
                document.querySelectorAll(".status_1").forEach((e, i) => {
                    e.innerHTML = "Desligar"
                });
                document.querySelector("table").onclick = ((e) => {
                    var t = e.target;
                    var ip = t.dataset.ip;
                    var port = t.dataset.port;
                    var l = (t.className == "status_0")?1:0;
                    window.location.href = ("/mod/" + ip + "/" + port + "/" + l)
                })
            }
        </script>
        <style type="text/css">
            .status_0 {
                color: white;
                background-color: red;
                cursor: pointer;
            }
            .status_1 {
                color: white;
                background-color: green;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <h1>Disciplina Sistemas Distribuidos e Redes de Comunicação</h1>
        <h2>Anderson Calixto - andersonbr@lia.ufc.br</h2>
        <table border="1" cellpadding="4" cellspacing="0" width="100%%">
            <thead>
                <tr><th>IP</th><th>PORTA</th><th>DESC</th><th>ESTADO</th><th>ACAO</th></tr>
            </thead>
            <tbody>
%s
            </tbody>
        </table>
    </body>
</html>"""


eqpInfo = []

def remEqp(ip, port):
    for e in eqpInfo:
        if (e['ip'] == ip and e['port'] == port):
            eqpInfo.remove(e)
            break

def modEqp(ip, port, field, value, sendToEqp):
    for e in eqpInfo:
        if (e['ip'] == ip and e['port'] == port):
            e[field] = value
            if sendToEqp == True:
                sendCmd = 'MOD '+str(value)
                e['socket'].send(sendCmd.encode())
            break

# ...
class EqpThread(threading.Thread):
    def __init__(self, client, address):
        threading.Thread.__init__(self)
        self.csocket = client
        self.caddress = address
    def run(self):
        print ("Eqp connection from: ", self.caddress)

        ip = str(self.csocket.getpeername()[0])
        port = self.csocket.getpeername()[1]
        # server = getsockname, remote = getpeername
        clientInfo = {
            'ip' : ip,
            'port' : port,
            'desc' : None,
            'estado' : None,
            'socket' : self.csocket
        }
        eqpInfo.append(clientInfo)
        client_file = self.csocket.makefile('rwb', 0)
        while True:
            line = client_file.readline()
            parts = line.decode('UTF-8').split(" ")
            print(parts)
            if parts[0] == "DESC":
                modEqp(ip, port, "desc", parts[1], False)
            if parts[0] == "ESTADO":
                modEqp(ip, port, "estado", parts[1], False)

            if not line or parts[0] == '\r\n' or parts[0] == '\n':
                print("finalizando cliente")
                break
        print ("Client at ", self.caddress , " disconnected...")
        # remover da lista
        remEqp(ip, port)
        self.csocket.close()

class EqpServerThread(threading.Thread):
    def __init__(self, listenaddr, listenport):
        # inicializar servico para equipamentos
        threading.Thread.__init__(self)
        self.saddress = socket.getaddrinfo(listenaddr, listenport)[0][-1]
        self.ssocket = socket.socket()
        self.ssocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.ssocket.bind(self.saddress)
        self.ssocket.listen(1)
    def run(self):
        print('Eqp listening on', self.saddress)
        while True:
            client, addr = self.ssocket.accept()
            client.settimeout(60)
            newthread = EqpThread(client, addr)
            newthread.start()
        s.close()

class WebServerThread(threading.Thread):
    def __init__(self, listenaddr, listenport):
        # inicializar servico para equipamentos
        threading.Thread.__init__(self)
        self.saddress = socket.getaddrinfo(listenaddr, listenport)[0][-1]
        self.ssocket = socket.socket()
        self.ssocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.ssocket.bind(self.saddress)
        self.ssocket.listen(1)
    def run(self):
        print('Web listening on', self.saddress)
        while True:
            client, addr = self.ssocket.accept()
            client.settimeout(60)
            newthread = WebClientThread(client, addr)
            newthread.start()
        s.close()

class WebClientThread(threading.Thread):
    def __init__(self, client, address):
        threading.Thread.__init__(self)
        self.csocket = client
        self.caddress = address
    def run(self):
        print ("Web Connection from : ", self.caddress)
        client_file = self.csocket.makefile('rwb', 0)
        while True:
            ip_mod = None
            port_mod = None
            val_mod = None
            line = client_file.readline()
            parts = line.decode('UTF-8').split(" ")
            if (parts[0] == "GET"):
                print ("URL: %s\n" % parts[1])
                modParts = parts[1].split("/")
                # exemplo: /mod/ip/porta/valor # habilitar/desabilitar pin
                if (len(modParts) == 5 and modParts[1] == "mod"):
                    ip_mod = modParts[2]
                    port_mod = int(modParts[3])
                    val_mod = int(modParts[4])
                    print("IP %s, Port: %d, Value: %d\n" % (ip_mod, port_mod, val_mod))
                    modEqp(ip_mod, port_mod, 'estado', val_mod, True)
            rows = ['<tr><td>%s</td><td>%d</td><td>%s</td><td>%s</td><td class="status_%s" data-ip="%s" data-port="%d"></td></tr>'
                    % (e['ip'], e['port'], e['desc'], e['estado'], e['estado'], e['ip'], e['port'])
                    for e in eqpInfo
                ]
            response_body = body % ('\n'.join(rows))
            response_head = head % (len(response_body))
            response = response_head + response_body
            self.csocket.send(response.encode())
            break
        print ("Client at ", self.caddress , " disconnected...")
        self.csocket.close()

if __name__ == "__main__":

    # inicializar thread de equipamentos
    serverEqpThread = EqpServerThread('0.0.0.0', 9999)
    serverEqpThread.start()
    # inicializar thread web
    serverWebThread = WebServerThread('0.0.0.0', 3001)
    serverWebThread.start()
