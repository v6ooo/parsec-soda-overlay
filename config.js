const PORT = 9002;
const HOST = '127.0.0.1';
const PATH = '/';
const PASSWORD = '';

// If you don't have a local gamepad/player then add // to the below line
// let localPlayer = [ { id: -1, userid: 0123456789, username: "YOURNAME", localplayer: true, metrics: { networkLatency: 0, fastRTs: 0, slowRTs: 0 } } ];


// Don't touch!
if (typeof exports != "undefined") { exports.config = { PORT: PORT, HOST: HOST, PATH: PATH, PASSWORD: PASSWORD } }
