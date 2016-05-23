# Web of Things - Final exercise
My idea for the final exercise of the course Web of Things was building an IoT temperature sensor that will adjust an addressable LED color strip depending on how warm it is.
The higher temperature, the more red the strip will glow. If the user desires, it can use the dashboard to disable the LED strip.

To realise this idea, I’ve used my own IoT framework/network for  the most part, you can view the code of the [server](https://github.com/reauv/minor-web-of-things-sensors-server) and [device](https://github.com/reauv/minor-web-of-things-device) and [read how it works](https://github.com/reauv/minor-web-of-things-sensors-server/blob/master/README.md).

For this exercise I made a few small modifications to the framework to accommodate for this project. Those changes/specifications are outlined below.

I’ve made some changes to the code that’s running on the server. This does the job of calculating the hue when the temperature changes and sends that to the client.
This code can be viewed [here](https://github.com/reauv/minor-web-of-things-sensors-server/blob/master/pubsub.js#L83-L91)

The code on the client for changing the LED strip can be found [here](https://github.com/reauv/minor-web-of-things-device/blob/master/src/OutputDevices/Strip.cpp)

The disabled flag is set by the server when it switches the button and is remember by the client so it knows when to ignore the server.

The code for reading the temperature data is [here](https://github.com/reauv/minor-web-of-things-device/blob/master/src/InputDevices/Temp.cpp).
