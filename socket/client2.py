import socket, sys

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

DESC='Som'
ESTADO=1

server_address = ('localhost', 9999)
print('connecting to %s port %s' % server_address)
sock.connect(server_address)
sock.send(('DESC '+DESC+'\n').encode())
sock.send(('ESTADO '+str(ESTADO)+'\n').encode())
data=''
while data!='quit':
	data = sock.recv(8192)
	if not data:
		print('\nDisconnected')
		sys.exit()
	print(data)
