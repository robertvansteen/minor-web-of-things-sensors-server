# Web of Things - Final exercise
For the final exercise I’ve used my IoT network/framework to use DHT22 temperature sensor that reads the temperature and modifies the color of a addressable LED strip to a hue depending on the temperature. The warmer the temperature, the more red the strip will be.

For this exercise I made a small modification to the code that’s running on the server. This does the job of calculating the hue when the temperature changes and sends that to the client.
This code can be viewed [here](https://github.com/reauv/minor-web-of-things-sensors-server/blob/master/pubsub.js#L83-L91)

The code on the client for changing the LED strip can be found [here](https://github.com/reauv/minor-web-of-things-device/blob/master/src/OutputDevices/Strip.cpp)

The disabled flag is set by the server when it switches the button and is remember by the client so it knows when to ignore the server.

The code for reading the temperature data is [here](https://github.com/reauv/minor-web-of-things-device/blob/master/src/InputDevices/Temp.cpp).
