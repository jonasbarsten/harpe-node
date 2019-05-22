## OSC-API

Broadcast on port `8050`, both in and out.

ex. in Max/MSP: `[udpsend 10.0.255.255 8050]` and `[udpreceive 8050]`

This works in association with the [client repo](https://github.com/jonasbarsten/harp-client)

|OUT|||
|---|---|---|
|/harp/`{ip}`/piezo/{0-7}|velocity 0.-1.|Float|
|/harp/`{ip}`/orientation|0 - 360 degrees|Int|
|/harp/`{ip}`/ping|date|Int `Unix timestamp`|
|/harp/`{ip}`/error|message|String|
|/ableton/`{ip}`/volume|Float `0. - 1.`|---|
|/ableton/`{ip}`/bpm|Int|---|

|IN|VALUE|DEFAULT|
|---|---|---|
|/harp/`{ip}`/update|`see below`|
|/harp/`{ip}`/cableLight|Float|
|/harp/`{ip}`/lights/global|clearAll|
|/harp/`{ip}`/lights/global/master|Float `0. - 1.`|1.|
|/harp/`{ip}`/lights/layer/{i}/start||false|
|/harp/`{ip}`/lights/layer/{i}/stop||true|
|/harp/`{ip}`/lights/layer/{i}/master|Float `0. - 1.`|1.|
|/harp/`{ip}`/lights/layer/{i}/speed|Int `ms to next tic`|500|
|/harp/`{ip}`/lights/layer/{i}/color|String `"255 255 255 255"`|10 10 10 10|
|/harp/`{ip}`/lights/layer/{i}/program|String `line-s/line-n/line-e/line-w/line-ne/line-nw/line-se/line-sw/random/randomTwo/randomThree/randomFour/randomFive/randomSix/allOn/allOff`|line-s|
|/harp/`{ip}`/lights/layer/{i}/dim|Not implemented yet|??|
|/harp/`{ip}`/lights/layer/{i}/piezo|Boolean|false|
|/harp/`{ip}`/lights/layer/{i}/magneticNorth|Boolean|false|
|/harp/`{ip}`/lights/layer/{i}/preOffset|Int `tics`|0|
|/harp/`{ip}`/lights/layer/{i}/postOffset|Int `tics`|0|

|RESERVED|LAYER||
|---|---|---|
|piezo 1|100|---|
|piezo 2|101|---|
|piezo 3|102|---|
|piezo 4|103|---|

* layer 100 = `piezo`
* change `{ip}` to `all` to address all available puffs
* when running `update all` from the front it will send a OSC update command to all available puffs.
* the update command consists of `cd`, `git pull` and `sudo reboot` on both the `harp-node` and `harp-client` repos.

NB: piezos will use the first 30 seconds after boot to calibrate them self, so no touching the first 30 sec!!

## Accordion spesific:

|NAME|MAC|IP|
|---|---|---|
|harp-1|b8:27:eb:6d:6d:d9|10.0.128.121|
|harp-2|b8:27:eb:ba:3e:3e|10.0.128.129|
|harp-3|b8:27:eb:63:69:1b|10.0.128.131|
|harp-4|b8:27:eb:4d:54:e6|10.0.128.139|
|harp-5|b8:27:eb:14:e9:2b|10.0.128.140|
|harp-6|b8:27:eb:d6:f7:cb|10.0.128.142|
|harp-7|b8:27:eb:5d:1d:59|10.0.128.119|
|harp-8|b8:27:eb:5c:75:90|10.0.128.145|
|harp-9|b8:27:eb:a2:0c:7d|10.0.128.126|

* Subnetmask: 255.255.0.0
* Router: 10.0.0.1
	* ubnt:ubnt
* Main switch: 10.0.0.2
	* ubnt:ubnt
* Main Mac: 10.0.0.10
	* accordion:jonaserkul
* UNMS: 10.0.0.11
	* admin:Jks78aUHBkjbas?hjewkjas2323
* LTE-modem: 192.168.1.1
	* admin:jonaserkul

Puffs MUST be connected after main rack has booted!

## Front repo:

The same front lives on all puffs and they know about each outher due to OSC ping broadcast, so the same front with the same content can be seen on port 5000 on any harp. 

* [client repo](https://github.com/jonasbarsten/harp-client)
* Puff GUI: http://harp.local:5000

Deploy:

* yarn build

## Pi setup

* ssh pi@ip
	* jonaserkul

Image files:

* [puff_backup_2018_05_21_1423.img](https://www.dropbox.com/s/n3zod5omfpd9moo/puff_backup_2018_05_21_1423.img?dl=0)
* [puff_backup_2018_05_21_1838.img](https://www.dropbox.com/s/sloj5mbn8rh5ccp/puff_backup_2018_05_21_1838.img?dl=0)

SD cards created with [etcher](https://etcher.io/)

After flash:

```
cd ~/harp-node
git pull
cd ~/harp-client
git pull
```

/etc/rc.local:

```
export PATH=/sbin:/usr/sbin:$PATH

su pi -c 'serve -s /home/pi/harp-client/build' &
su pi -c 'nodemon /home/pi/harp-node/server.js'

exit 0
```