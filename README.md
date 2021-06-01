# VRacing

A Car Racing simulator built in THREE.js that can run in the browser and take inputs from the keyboard to control the car dynamics for driving around a track.

Courtesy of Bruno Simon of https://threejs-journey.xyz/

## Setup
Download [Node.js](https://nodejs.org/en/download/).

Run the following commands to install the required dependancies

``` bash
# Change to the root folder
cd VRacing

# Install dependencies (only the first time)
npm install
```

## Running

Run the following commands to start the simulator

``` bash
# Run the local server at localhost:8080
npm run dev
```

This should open a browser window to load the game. For best compatibility, use chrome to view the simulator. Then, the car can be controlled by accelerating with the up-down keys, and steering with the left-right keys. The mouse can be moved to pan around the car. The starting camera mode ('f' key) is to follow behind the car but pressing the 'g' key will ender the global mode which allows the camera to be moved in the forward direction with the w-s keys, sideways with the a-d keys, or up and down with the c-space keys.

## VRduino integration

To use the VRduino to rotate the camera about its current position, first load the file at src/vrduino/vrduino.ino in the teensyduino IDE and upload the the VRduino. Then, start the server to stream the rotation data from the VRduino.

``` bash
# Change to the server folder
cd src/server

# Install dependencies (only the first time)
npm install

# Start the server
node server.js
```

Then, the rotation of the camera in the car simulator should respond to movement of the VRduino headset.