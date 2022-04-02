"use strict";
{
	let m = new Module();
	o.ws = m;
	m.connection = null;
	m.host = {
		id: 0,
		userid: 0,
		username: ""
	};
	m.guests = [];
	m.gamepads = [];
	m.handler = {};
	m.hooks = {};

	let isJSON = function(data) {
		var check = true;
		try {
			JSON.parse(data);
		} catch(e) {
			check = false;
		}
		return check;
	}

	let setGamepad = function(index, id, userid, username) {
		index += localPlayer.length;
		if (!m.gamepads[index]) m.gamepads[index] = {};
		m.gamepads[index].id = id;
		m.gamepads[index].userid = userid;
		m.gamepads[index].username = username;
	}

	let executeHandler = function(event, msg) {
		if (typeof m.handler[msg.type] == "function") {
			m.handler[msg.type](event, msg);
		}
		if (m.hooks[msg.type]) {
			for (const h of m.hooks[msg.type]) {
				if (typeof h == "function") h(event, msg);
			}
		}		
	}

	m.addHook = function(name, func) {
		if (!m.hooks[name]) {
			m.hooks[name] = [];
			m.hooks[name].push(func);
		}
		else {
			let hooked = m.hooks[name].find(hook => hook == func);
			if (!hooked) m.hooks[name].push(func);
		}
	}

	m.removeHook = function(name, func) {
		if (!m.hooks[name]) return;
		else {
			for (let i=0; i<m.hooks[name].length; i++) {
				if (m.hooks[name][i] == func) m.hooks[name].splice(i, 1);
			}
		}
	}

	m.handler.identify = function(e, data) {
		if (data.userid > 0) {
			m.host.id = data.id;
			m.host.userid = data.userid;
			m.host.username =  data.username;
		}
	}

	m.handler.metrics = function(e, data) {
		m.guests = [];
		for (const lp of localPlayer) {
			m.guests.push(lp);
		}
		for (const d of data.content) {
			m.guests.push({
				id: d.id,
				userid: d.userid,
				username: d.username,
				banned: d.banned,
				metrics: {
					networkLatency: d.networkLatency,
					fastRTs: d.fastRTs,
					slowRTs: d.slowRTs,
				}
			});
		}
	}

	m.handler.gueststate = function(e, data) {
		switch(data.state) {
			case 4: // connect
				let g = m.guests.find(guest => guest.id == data.id);
				// let alreadyAdded = false;
				// for (let i=0; i<m.guests; i++) {
				// 	if (m.guests[i].id == data.id) alreadyAdded = true;
				// }
				if (!g) {
					m.guests.push({
						id: data.id,
						userid: data.userid,
						username: data.username,
						banned: data.banned,
						metrics: { networkLatency: 0, fastRTs: 0, slowRTs: 0 }
					});
				}
				break;
			case 8: // disconnect
				for (let i=0; i<m.guests.length; i++) {
					if (m.guests[i].id == data.id) {
						m.guests.splice(i, 1);
					}
				}
				break;
		}
	}

	m.handler.gamepadall = function(e, data) {
		m.gamepads = [];
		for (const lp of localPlayer) {
			m.gamepads.push(lp); // will push some extra metric data but who cares
		}
		for (const d of data.content) {
			m.gamepads.push(d);
		}
	}

	m.handler.gamepadconnect = function(event, data) {
		setGamepad(data.index, data.id, data.userid, data.username);
	}

	m.handler.gamepadassign = function(event, data) {
		setGamepad(data.index, data.toid, data.touserid, data.tousername);
	}

	m.handler.gamepadstrip = function(event, data) {
		setGamepad(data.index, 0, 0, "");
	}

	m.handler.gamepadmove = function(event, data) {
		setGamepad(data.fromindex, data.fromid, data.fromuserid, data.fromusername);
		setGamepad(data.toindex, data.toid, data.touserid, data.tousername);
	}

	m.init = function() {
		// m.connection = new WebSocket(m.url, 'overlay');
		m.connection = new WebSocket("ws://"+HOST+":"+PORT+PATH, 'overlay');
		m.connection.addEventListener('close', function (event) {
			executeHandler(event, { type: "serverdisconnect" });
		});
		m.connection.addEventListener('open', function (event) {
			m.connection.send(`{"type":"identify","password":"${PASSWORD}"}`);
			executeHandler(event, { type: "serverconnect" });
		});
		m.connection.addEventListener('message', function(event) {
			if (!isJSON(event.data)) return;
			let msg = JSON.parse(event.data);
			executeHandler(event, msg);
		});
	}
	setTimeout(m.init, 250); // delay connection
}
