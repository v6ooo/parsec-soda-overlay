const debugMessages = false;

const { config } = require('../config.js');

const allowedRemoteAddress = ['127.0.0.1']; // ['127.0.0.1','::1','::ffff:127.0.0.1'];

const http = require('http');
const parse = require('url');
const WebSocket = require('ws');

const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
const wss = new WebSocket.Server({ noServer: true });
server.listen(config.websocketPort, config.websocketHost, function() {
    console.log((new Date()) + ' Server is listening on '+ config.websocketHost +":"+ config.websocketPort + config.websocketPath);
});

let connections = [];
let connectionId = 0;
const allowedProtocols = { "soda": true, "overlay": true }

function sendMessage(con, message, invert=false) {
	let i=1;
    if (connections.length > 0) {
		for (const c of connections) {
			if (con.id != c.id && (
				(invert == true && con.connectionType == c.connectionType) ||
				(invert == false && con.connectionType != c.connectionType)
				)) {
				c.send(message);
			}
		}
    }
}

function authenticate(ws, data, isBinary) {
	if (!ws.authenticated) {
		let close = true;
		if (!isBinary) {
			const msg = JSON.parse(data.toString());
			if (msg.type ==  "identify") {
				if (msg.password == config.websocketPassword)
				{
					console.log(`(${ws.id}) Authenticated (${ws.remoteAddress})`);
					clearTimeout(ws.authenticationTimer);
					ws.authenticated = true;
					close = false;
					if (msg.userid) {
						ws.hostUser = {
							id: msg.id,
							userid: msg.userid,
							username: msg.username
						}
					}
					else {
						for (let i=connections.length-1; i>=0; i--) {
							if (!connections[i].hostUser) continue;
							let c = connections[i];
							ws.send(`{"type":"identify","id":${c.hostUser.id},"userid":${c.hostUser.userid},"username":"${c.hostUser.username}"}`);
						}

					}
				}
			}
		}
		if (close) {
			console.log(`(${ws.id}) Incorrect Auth. Terminating connection (${ws.remoteAddress})`);
			clearTimeout(ws.authenticationTimer);
			ws.terminate();
		}
		return false;
	}
	return true;
}

function on_close(code, reason) {
    console.log(`(${this.id}) ${this.connectionType} disconnected (${this.remoteAddress})`);
    // sendMessage(this, `(${this.id}) ${this.connectionType} disconnected`);
    for (let i=0; i<connections.length; i++) {
        if (connections[i].id == this.id) {
            connections.splice(i, 1);
        }
    }
}

function on_message(data, isBinary) {
	let auth = authenticate(this, data, isBinary);
	if (!this.authenticated && !auth) return;
	if (isBinary) return;
	const msg = data.toString();
	if (debugMessages) console.log(msg);
	sendMessage(this, msg);
	if (this.connectionType == "soda") {
		let jmsg = JSON.parse(msg);
		if (jmsg.type == "chat") {
			sendMessage(this, msg, true);
		}
	}
}

wss.on('connection', function connection(ws, request, connectionType) {
	ws.id = connectionId++;
	ws.connectionType = connectionType;
	ws.authenticated = false;
	ws.authenticationTimer = setTimeout(() => {
		console.log(`(${ws.id})Failed to Auth. Terminating connection (${ws.remoteAddress})`);
		ws.terminate();
	}, 3000);
	connections.push(ws);
	console.log(`(${ws.id}) ${ws.connectionType} connected (${ws.remoteAddress})`);
	ws.on("close", on_close);
	ws.on("message", on_message);
	// sendMessage(connectionType, `(${ws.id}) ${ws.connectionType} connected`, true);

});

server.on('upgrade', async function upgrade(request, socket, head) {
	let connectionType = "";
	if (request.url != config.websocketPath) {
		console.log(`Rejected connection. Path incorrect (${socket.remoteAddress})`);
		socket.destroy();
		return;
	}
	if (allowedRemoteAddress.indexOf(socket.remoteAddress) == -1) {
		console.log(`Rejected connection. IP not accepted (${socket.remoteAddress})`);
		socket.destroy();
		return;
	}
	if (!request.headers["sec-websocket-protocol"] || !allowedProtocols[request.headers["sec-websocket-protocol"]] ) {
		console.log(`Rejected connection. Protocol not accepted (${socket.remoteAddress})`);
		socket.destroy();
		return;
	}
	connectionType = request.headers["sec-websocket-protocol"];
	wss.handleUpgrade(request, socket, head, function done(ws) {
		ws.remoteAddress = socket.remoteAddress;
		wss.emit('connection', ws, request, connectionType);
	});
});
