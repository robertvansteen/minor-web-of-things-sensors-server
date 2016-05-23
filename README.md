# MQTT research
During the course Web of Things the use of MQTT was suggested for students that would like some technical software challenge and use a more efficient way to communicate between _things_ that are connected all over the world. That did sound like a challenge to me so I started learning more about the protocol.

## What is MQTT?
So, what is MQTT? MQTT is a _machine-to-machine connectivity protocol that is designed to be an extremely lightweight publish/subscribe messaging transport._
This means it’s extremely useful for situations where there is not much computing power or a good network connection available, so it can be used on low power devices like an Arduino and on slow mobile networks like GPRS or networks that do not allow much data like LoRa.

## How does MQTT work?
MQTT works with a publish/subscribe system, clients and a broker (server). The clients can send (publish) messages on topics. This message is sent to the broker, the broker receives this message and will forward this to all the clients that are subscribed to the topic. This allows the client to send a message to other clients, without directly communicating with them.

### Publish
A client can publish a message. This message must be published on a certain topic so that there is context available to the message and that the message will be delivered to the clients that are interested in the topic.

### Subscribe
A client can also subscribe to a topic. This is done by sending a special message to the broker letting it know the client wants to receive message published on a certain topic. The broker will remember this and from that moment on every message that is published on that topic will be forwarded to the client.

The topic name can just be a string like `presence` but it also supports a more dynamic syntax that allows a client to subscribe to multiple topics in a way that it doesn’t have to be explicit about them. There are two special characters when subscribing to a topic, the `+` and the `#`.
The `+` is used as a wildcard for single level hierarchy. For example the topic `livingroom/lamp/+` will match
- `livingroom/lamp/1`
- `livingroom/lamp/tv`
- `livingroom/lamp/couch`

But not `livingroom/lamp/1/2`

The `#` can be used as a wildcard for all the remaining levels of hierarchy. For example the topic `livingroom/#` will match
- `livingroom/lamp`
- `livingroom/lamp/1`
- `livingroom/tv/1/status`

### Unsubscribe
The client can also unsubscribe from a certain topic when it’s no longer interested in it.

## How did I use MQTT?
The power of the wildcard topics really inspired me to work out something that is really dynamic and re-usable. The power of Internet of Things lies in the plural form of ‘thing’: you can connect a large amount of low power & cost devices to build a really powerful network that is capable for a lot of things. But in software development a large network is a difficult to maintain. So I started working on an idea to make such a network maintainable in a way that working it remains fun and not frustrating.

I’ve implemented this idea in 2 parts, the server and the client.

### Server
The server consists of two parts: an HTTP server for displaying data and controls and a MQTT server that is responsible for communication between the devices.

The HTTP server is not that interesting, it’s just a regular Node Express server that uses Handlebars behind the scenes to display the data & controls.

The MQTT server is a bit more complex and it’s job is to keep track of the connected clients, information about them and the data. The data is stored with (NeDB)[https://github.com/louischatriot/nedb] in local files, so it doesn’t need an external database and is easy to setup.

So how does the server manage multiple devices? The answer lies in the topic wildcards. These allow the server to respond in a dynamic way when a client publishes something.

Here is a list of topics the server handles and the idea behind them.
- `+device/register` - When a device powers up it will publish this message to the server with an `id` & `label`. This way the server knows about the device. The `+device` wildcard will be the ID of the device. For example: `livingroom`.
- `+device/register/output` - This topic is used to register the output of a device. For example a LED. The format for this message is an array of outputs, that contain an `id`, `label` & `type`.
- `+device/register/input` - This topic is used to register the inputs of a device. For example a button or sensor. The format for this message is an array of inputs, that contain an `id`, `label` & `type`.
- `+device/input/+sensor` - With this topic the device can send data to the server. The `+sensor` wildcard represents the `id` of the sensor (specified in the register topic). The data must be an object containing a key/value pair of the `value`.
- `+device/output/+id/status` - This topic is responsible for keeping track of the status of an output on a device. When the status of an output changes on a device, for example an LED is turned on, wether this is from local input or from external input, the device is supposed to let the server know the status is changed so it must publish a message with the `id` of the output and a message that has a `value` object with the status of the output.

For the server I’ve used the popular MQTT package on NPM for setting up the MQTT broker with node.
https://github.com/mqttjs/MQTT.js

### Client
For the client I’ve developed a small C++ framework that can be re-used for all the devices and is very flexible and dynamic.
The reason I’ve started working on this framework is because there was no easy way to work with multiple MQTT topics in a dynamic way without long and unmaintainable if statements. I wanted something where you can easily add I/O, and just add a file with a function that either runs when there is a relevant message published (in the case of output) or a function that is called every loop so that you can publish something (in the case of input).

Because I’ve never worked with C++ this was quite a challenge, as refactoring and extracting things are not as easy as with for example JavaScript or PHP, also debugging on a device can be quite difficult. But after some long nights and a lot of frustration I’m quite proud to say that the framework is stable now & allows for easy expansion.

The code for the framework can be found [here](https://github.com/reauv/minor-web-of-things-device).

So how does it work? The most important part are the **InputManager** & **OutputManager**. These files allow you to register input & output and are the ones you want to modify to specify how your device is configured. There are a few files in the **InputDevices** & **OutputDevices** folder that can be used straight away. For example the `Temp.cpp` file has a class that is configured to use the DHT22 temperature sensor. Just change whatever port it is connected and it works out of the box. The `loop` function on the class is automatically called every loop on the device. And what’s really nice is that the `publish` function that is available on every extension of the Input class automatically sets the topic that matches the convention. So if you register the Temperature sensor with an id of `temp` and the device with the id of `livingroom` calling the publish method will send a message on the topic `livingroom\input\temp`.
This really saves a lot of time and tracking down wrong topic names.

The same goes for the Output, for example there is a `Light.cpp` class that allows you to turn a LED on/off. When this class is register with an id of `led` for example, the `callback` method on the class will automatically be called when a message is received from the broker with a topic `output/led/set`. This also saves a ton of time.

Of course I did not do all the work myself, so I have to give credits to _knolleary_ for developing an [MQTT library](https://github.com/knolleary/pubsubclient) that works with C++ on NodeMCU. Also thanks to _bblanchon_ for creating a [JSON library ](https://github.com/bblanchon/ArduinoJson) for Arduino.

## Conclusion
I’ve developed both the server & the device framework to allow for easy future use. It’s something I’m definitely going to use when I work on an IoT project in the future. Setting up a single device in combination with a server is easy and you can hardcode a lot of stuff and it’ll work fine. But it’s really going to grind your gears when you add more _things_ to your network and it starts falling apart. The convention this IoT network uses prevents that and allows scaling.

## Sources
This research, documentation & code is written with help of the following sources:
- https://en.wikipedia.org/wiki/MQTT
- http://mqtt.org
- http://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices
- https://github.com/mqttjs/MQTT.js
- https://github.com/knolleary/pubsubclient
