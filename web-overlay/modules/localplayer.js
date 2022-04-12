"use strict";
{
	let m = new Module();

	m.playerNames = [];
	m.players = [];

	function updateNumber(_this) {
		_this.parentNode.children[0].innerHTML = m.playerNames.length;
	}

	function resetPlayers() {
		m.players = [];
	}

	function makePlayers() {
		resetPlayers();
		let gmod = o.getModule("websocket");
		for (let i=0; i<m.playerNames.length; i++) {

			let id = (i+1) * -1;
			let userid = (i+1) * -1;
			let username = m.playerNames[i];

			if (gmod && gmod.host.userid > 0) {
				userid = gmod.host.userid;
				username = gmod.host.username;
			}

			m.players.push
			(
				{
					id: id,
					userid: userid,
					username: username,
					localplayer: true,
					metrics: {
						networkLatency: 0,
						fastRTs: 0,
						slowRTs: 0
					}
				}
			)
		}
	}

	m.setDefault = function() {
		m.playerNames = [].concat(config.defaultLocalPlayers);
		makePlayers();
		if (this && this.innerHTML) updateNumber(this);
	}

	m.add = function() {
		let username = config.defaultLocalPlayers[0] || "";
		let gmod = o.getModule("websocket");
		if (gmod.host.userid > 0) username = gmod.host.username;
		m.playerNames.push(username);
		makePlayers();
		updateNumber(this);
	}

	m.removeAll = function() {
		m.playerNames = [];
		m.players = [];
		updateNumber(this);
	}

	m.updateHost = function(name) {
		m.hostName = name;
		makePlayers();
	}

	if (config.defaultLocalPlayers.length > 0) {
		m.setDefault();
	}

	m.thisMenu = ["Local players (Delayed)",
		[
			[m.playerNames.length],
			["Default", m.setDefault],
			["Add", m.add],
			["Remove all", m.removeAll],
		]
	];
	m.addMenu(m.thisMenu);

}
