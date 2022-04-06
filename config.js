"use strict";
const config = {
    websocketHost: '127.0.0.1',
    websocketPort: 9002,
    websocketPath: '/',
    websocketPassword: '',

    defaultScale: 100,
    defaultWindowAmount: 4,
    defaultNametagPosition: "top right",
}

// If you don't have a local gamepad/player then add // to the below line
// const localPlayer = [ { id: -1, userid: 0123456789, username: "YOURNAME", localplayer: true, metrics: { networkLatency: 0, fastRTs: 0, slowRTs: 0 } } ];


// Don't touch!
if (typeof exports != "undefined") { exports.config = config }
