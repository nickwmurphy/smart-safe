// Libraries for the voltage keypad and the fingerprint sensor
#include "SparkFunVKeyVoltageKeypad.h"
#include "FPS_GT511C1R.h"
#include "SoftwareSerial.h"

// Define all of the basic output and input devices 
// (LEDs, speaker, solenoids, potentiometer, force sensitive resistor)
const int redLEDtop = 13;
const int blueLEDtop = 6;
const int greenLEDtop = 7;
const int redLEDdoor = 11;
const int blueLEDdoor = 9;
const int greenLEDdoor = 10;
const int speaker = 8;
const int solenoids = 12;
const int pot = 2;
const int fsr = 0;

// Handle incoming data from node
int MAX_CMD_LENGTH = 10;
char cmd[10];
int cmdIndex;
char incomingByte;

// Define the fingerprint sensor and the voltage keypad 
FPS_GT511C1R fps(4, 5);
VKey keypad(A1, VKey::THREE);

// Set the passcode and the variables needed to control it
const int passcode[4] = {10, 8, 9, 7};
int attempt[4] = {};
int index = 0;

// On setup, set all devices to input or output
// Initiate the FPS and turn on its light
void setup() {
  Serial.begin(9600);
  cmdIndex = 0;
  pinMode(redLEDtop, OUTPUT);
  pinMode(greenLEDtop, OUTPUT);
  pinMode(blueLEDtop, OUTPUT);
  pinMode(redLEDdoor, OUTPUT);
  pinMode(greenLEDdoor, OUTPUT);
  pinMode(blueLEDdoor, OUTPUT);
  pinMode(speaker, OUTPUT);
  pinMode(solenoids, OUTPUT);
  pinMode(fsr, INPUT);
  neutralLightOn('t');
  delay(100);
  delay(5);
  delay(5);
  fps.Open();
  fps.SetLED(true);
}

// Constantly listen for the FPS
// Lock the door if force is over 100
// Switch from keypad to FPS based on potentiometer setting
// Constantly listen for web input
void loop() {
  idFinger();
  if(readFSR() > 100) {
    lock();
  }
  if(readPot() > 1000) {
    neutralLightOn('d');
    fps.SetLED(false);
    keypadListener();
  } else if(readPot() <= 1000 && readPot() >= 23) {
    neutralLightOff('d');
    fps.SetLED(false);
  } else if(readPot() < 23) {
    neutralLightOff('d');
    fps.SetLED(true);
  }
  webListener();
} 

// return the potentiometer reading
int readPot() {
  return analogRead(pot);
}

// to set the RGB LEDs easily
void setColor(int r, int g, int b, int red, int green, int blue) {
  analogWrite(r, 255 - red);
  analogWrite(g, 255 - green);
  analogWrite(b, 255 - blue);  
}

// the red light that comes on when failed entry occurs
void failLight() {
  setColor(redLEDtop, greenLEDtop, blueLEDtop, 255, 0, 0);
  delay(3000);
  neutralLightOn('t');
}

// the tone that occurs on failed entry
void failTone() {
  tone(speaker, 44500);
  delay(1000);
  noTone(speaker);
}

// the green light that comes on when successful entry occurs
void successLight() {
  setColor(redLEDtop, greenLEDtop, blueLEDtop, 0, 255, 0);
  delay(3000);
  neutralLightOn('t');
}

// the tone that occurs on successful entry
void successTone() {
  tone(speaker, 5000, 1000);
  delay(1000);
  noTone(speaker);
}

// the neutral light on (blue)
void neutralLightOn(char l) {
  if (l == 't') {
    setColor(redLEDtop, greenLEDtop, blueLEDtop, 0, 0, 255);
  } else if (l == 'd') {
    setColor(redLEDdoor, greenLEDdoor, blueLEDdoor, 0, 0, 255);
  }
}

// the neutral light off (no color)
void neutralLightOff(char l) {
  if (l == 't') {
    setColor(redLEDtop, greenLEDtop, blueLEDtop, 0, 0, 0);
  } else if (l == 'd') {
    setColor(redLEDdoor, greenLEDdoor, blueLEDdoor, 0, 0, 0);
  }  
}

// lock door by writing solenoids to LOW
void lock() {
  digitalWrite(solenoids, LOW);
}

// unlock door by writing the solenoids to HIGH
void unlock() {
  digitalWrite(solenoids, HIGH);
}

// return the reading from the FSR
int readFSR() {
  return analogRead(fsr);
}

// read the fingerprint, see if it matches a stored fingerprint
// if yes, run the success sequence and unlock
// if no, run the fail sequence
// print to serial so node can update 
void idFinger() {
  if(fps.IsPressFinger()) {
    fps.CaptureFinger(false);
    int id = fps.Identify1_N();
    if(id < 20) {
      successTone();
      successLight();
      unlock();
      String id_str = String(id);
      Serial.println("SLD#" + id_str + "\n");
    } else {
      failTone();
      failLight();
      Serial.println("SLD#4\n");
    }
  }
  delay(100);
}

// store keystrokes in the array from above
// check them against the desired code
void keypadListener() {
  VKey::eKeynum k;
  if(keypad.checkKeys(k) && k > 0) {
    attempt[index] = k;
    Serial.println(attempt[index]);
    if(index > 2) {
      checkAttempt();
      index = 0;
    } else {
      index++;
    }
  }
  delay(50);
}

// check keystrokes, see of they match the desired code
// if yes, run the success sequence and unlock
// if no, run the fail sequence
// print to serial to alert node to update
void checkAttempt() {
  if(attempt[0] == passcode[0] && attempt[1] == passcode[1] && 
  attempt[2] == passcode[2] && attempt[3] == passcode[3]) {
    successTone();
    successLight();
    unlock();
    Serial.println("SLD#2\n");
    } else {
    failTone();
    failLight();
    Serial.println("SLD#3\n");
  }  
}

// take in bytes from serial 
// if OPEN command is received, run the success sequence and unlock
void webListener() {
  if (incomingByte = Serial.available() > 0) {
    char byteIn = Serial.read();
    cmd[cmdIndex] = byteIn;
    if(byteIn =='\n') {
      cmd[cmdIndex] = '\0';
      cmdIndex = 0;
      String stringCmd = String(cmd);
      if(strcmp(cmd, "OPEN") == 0) {
        successTone();
        successLight();
        unlock();
      } 
    } else {
      if(cmdIndex++ >= MAX_CMD_LENGTH) {
        cmdIndex = 0;
      }
    }
  }
}    
