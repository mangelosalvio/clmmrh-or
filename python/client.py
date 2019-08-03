#!/usr/bin python

import socket

HOST = '127.0.0.1'
PORT = 1337
BUFFER_SIZE = 1024


s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

while True:
    print "Waiting for data..."
    data = s.recv(BUFFER_SIZE)
    print 'Received data : ' + data
    if data == 'w':
        weight = input('Enter Weight : ')
        response = str({"weight": weight})
        s.send(response)
    elif data == 'tc':
        uid = input('Enter UID : ')
        response = str({"uid": uid})
        s.send(response)

    if not data:
        break

    #data = raw_input('Please enter your data : ')
    # if data == 'EXIT':
    #   break
    # else:
    #   s.send(data)


print "Exiting..."
s.close()
