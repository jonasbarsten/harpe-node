## OSC-API

Broadcast on port `8050`, both in and out.

ex. in Max/MSP: `[udpsend 10.0.0.255 8050]` and `[udpreceive 8050]`

This works in association with the [client repo](https://github.com/jonasbarsten/harp-client)

|OUT|||
|---|---|---|
|/harp/`{ip}`/ping|date|Int `Unix timestamp`|
|/harp/`{ip}`/error|message|String|

|IN|VALUE|DEFAULT|
|---|---|---|
|/harp/`{ip}`/update|`see below`|
|/harp/`{ip}`/pwm/{i}|Float|
|-----|-----|-----|
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


* change `{ip}` to `all` to address all available puffs
* when running `update all` from the front it will send a OSC update command to all available puffs.
* the update command consists of `cd`, `git pull` and `sudo reboot` on both the `harp-node` and `harp-client` repos.

## Front repo:

The same front lives on all harps and they know about each outher due to OSC ping broadcast, so the same front with the same content can be seen on port 5000 on any harp. 

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