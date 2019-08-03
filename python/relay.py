#!/usr/bin python
import RPi.GPIO as GPIO
import socket
import time

HOST = '192.168.22.102'
PORT = 1337
BUFFER_SIZE = 1024

ZONE_1 = (35, 37)
ZONE_2 = (31, 33)
ZONE_3 = (13, 15)
ZONE_4 = (16, 18)
ZONE_5 = (36, 38)

ZONES = [ZONE_1, ZONE_2, ZONE_3, ZONE_4, ZONE_5]


def processZone(i, index):
    if i == '0':
        print 'TURN OFF ' + str(index)
        GPIO.output(ZONES[index][0], 0)
        GPIO.output(ZONES[index][1], 0)
    else:
        print 'TURN ON ' + str(index)
        GPIO.output(ZONES[index][0], 1)
        GPIO.output(ZONES[index][1], 1)


def main():
    GPIO.setwarnings(False)  # Ignore warning for now
    GPIO.setmode(GPIO.BOARD)  # Use physical pin numbering

    for item in ZONES:  # setup pins
        GPIO.setup(item[0], GPIO.OUT, initial=1)
        GPIO.setup(item[1], GPIO.OUT, initial=1)

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((HOST, PORT))

    while True:  # Run foreverz
        print "Waiting for data..."
        data = s.recv(BUFFER_SIZE)

        index = 0
        for i in data:
            processZone(i, index)
            index += 1

        if not data:
            break

    s.close()


if __name__ == "__main__":
    main()
