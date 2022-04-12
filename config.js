"use strict";
const config = {
    websocketHost: '127.0.0.1',
    websocketPort: 9002,
    websocketPath: '/',
    websocketPassword: '',

    defaultScale: 100,
    defaultWindowAmount: 4,
    defaultNametagPosition: "top right",

     // Can add single [ "yourName" ] or multiple [ "yourName", "yourName" ];
     // All names currently replaced by host name
    defaultLocalPlayers: [ ],
}

// Don't touch!
if (typeof exports != "undefined") { exports.config = config }
