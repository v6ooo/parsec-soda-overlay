"use strict";
{
	let m = new Module();
	m.loadCSS();
	m.createContainer();

	let visibleDuration = 15000; // 15 sec
	// let clearDuration = 15000; // 15 sec
	let maxMessages = 200;

	let hideTimer;
	let pauseScroll = false;

	let messages = document.createElement("div");
	messages.className = "messages";
	m.container.appendChild(messages);

	o.module.menu.trigger.addEventListener("contextmenu", function(event) {
		m.container.style.display = (m.container.style.display != 'none') ? 'none' : 'block';
		event.preventDefault();
		return false;
	} );

	m.toggleChat = function() {
		this.status = !this.status;
		this.innerHTML = (!this.status) ? 'Hide' : 'Show';
		let newStyle = (!this.status) ? 'visible' : 'hidden';
		m.container.style.visibility = newStyle;
	}

	m.container.addEventListener("scroll", function(event) {
		let currentScroll = this.scrollTop
		let maxScroll = this.scrollHeight-this.clientHeight;
		if (currentScroll+20 < maxScroll) {
			pauseScroll = true;
			this.className = "paused";
			m.stopHideChat()
		}
		else {
			pauseScroll = false;
			this.className = null;
			m.showChat();
		}
	});

	m.scrollDown = function() {
		if (!pauseScroll) m.container.scrollTop = m.container.scrollHeight;
	}

	let stringToHslColor = function(str, s, l) {
		var hash = 0;
		for (var i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		var h = hash % 360;
		return 'hsl('+h+', '+s+'%, '+l+'%)';
	}

	function escapeHtml(text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}

	let getTimestring = function() {
		let tn = new Date();
		let tstring = tn.getFullYear() +'-'
		+ ('0'+(tn.getMonth()+1)).slice(-2) +'-'
		+ ('0'+tn.getDate()).slice(-2) +' '
		+ ('0'+tn.getHours()).slice(-2) +':'
		+ ('0'+tn.getMinutes()).slice(-2) +':'
		+ ('0'+tn.getSeconds()).slice(-2) +' | ';
		return tstring;
	}

	m.removeMessages = function() {
		let msgAmount = messages.childElementCount;
		while (msgAmount > maxMessages) {
			messages.removeChild(messages.firstChild);
			msgAmount--;
		}
	}

	m.stopHideChat = function() {
		clearTimeout(hideTimer);
	}

	m.showChat = function() {
		// m.container.style.visibility = 'visible';
		m.container.style.display = 'block';
		m.stopHideChat();
		// clearTimeout(clearTimer);
		if (!pauseScroll) hideTimer = setTimeout(m.hideChat, visibleDuration);
	}

	m.hideChat = function() {
		// m.container.style.visibility = 'hidden';
		if (!pauseScroll) m.container.style.display = 'none';
		// clearTimer = setTimeout(clearChat, clearDuration);
	}

	m.clearChat = function() {
		messages.innerHTML = '';
	}

	m.addMessage = function(event, data) {
		let li = document.createElement('li');
		let wrapbox = document.createElement('span');
		let msg = document.createElement('span');
		li.appendChild(wrapbox);
		wrapbox.appendChild(msg);
		if (data.type) wrapbox.classList.add(data.type);
		let html = '<span class="alwayshidden">'+ getTimestring() +'</span>';
		if (data.type == "chat") {
			let nameColor = stringToHslColor(data.username+data.id+data.userid, 100, 80);
			html += '<span style="color: '+nameColor+'">'+ data.username +'</span><span class="hidden"> #'+ data.userid +'</span>: ';
		}
		html += escapeHtml(data.content);
		msg.innerHTML = html;
		messages.appendChild(li);
		m.removeMessages();
		m.showChat();
		m.scrollDown();
	}

	o.ws.addHook("chat", m.addMessage);
	o.ws.addHook("command", m.addMessage);

	m.addStatusMessage = function(msg) {
		m.addMessage(null, { type: "status", content: msg });
	}

	function template(strings, ...keys) {
		return (function(...values) {
			let dict = values[values.length - 1] || {};
			let result = [strings[0]];
			keys.forEach(function(key, i) {
				let value = Number.isInteger(key) ? values[key] : dict[key];
				result.push(value, strings[i + 1]);
			});
			return result.join('');
		});
	}
	let strings = {
		serverconnect: template`Connected to server`,
		serverdisconnect: template`Disconnected from server`,
		guestconnect: template`${0} #${1} connected`,
		guestdisconnect: template`${0} #${1} disconnected`,
		guestban: template`${0} #${1} banned`,
		// guestfail: template`${0} #${1} failed to connect: ${2}`,
		gamepadconnect: template`${0} took control of Gamepad ${1}`, // guest press a button
		gamepadassign: template`${0} assigned Gamepad ${1}`, // drag&drop from guest list
		gamepadremove: template`${0} removed from Gamepad ${1}`, // drag&drop from guest list
		gamepadstrip: template`${0} stripped of Gamepad ${1}`, // strip from gamepad list
		gamepadmove: template`${0} moved to Gamepad ${1}`, // move from gamepad list
	}

	m.handler = {};

	m.handler.serverconnect = function(event, data) {
		m.addStatusMessage( strings[data.type]() );
	}

	m.handler.serverdisconnect = function(event, data) {
		m.addStatusMessage( strings[data.type]() );
	}

	m.handler.gueststate = function(event, data) {
		switch(data.state) {
			case 4: // connected
				if (!data.banned) m.addStatusMessage( strings.guestconnect( data.username, data.userid ));
				break;
			case 8: // disconnected
				if (data.banned) m.addStatusMessage( strings.guestban( data.username, data.userid ));
				else m.addStatusMessage( strings.guestdisconnect( data.username, data.userid ));
				break;
		}
	}

	m.handler.gamepadconnect = function(event, data) {
		m.addStatusMessage( strings[data.type](data.username, data.index+1) );
	}

	m.handler.gamepadassign = function(event, data) {
		if (data.fromid == data.toid) return;
		if (data.fromid > 0) m.addStatusMessage( strings.gamepadremove(data.fromusername, data.index+1) );
		if (data.toid > 0) m.addStatusMessage( strings[data.type](data.tousername, data.index+1) );
	}

	m.handler.gamepadstrip = function(event, data) {
		m.addStatusMessage( strings[data.type](data.username, data.index+1) );
	}

	m.handler.gamepadmove = function(event, data) {
		if (data.fromid == data.toid) return;
		if (data.fromid > 0) m.addStatusMessage( strings[data.type](data.fromusername, data.fromindex+1) );
		if (data.toid > 0) m.addStatusMessage( strings[data.type](data.tousername, data.toindex+1) );
	}

	for (let i in m.handler) {
		o.ws.addHook(i, m.handler[i]);
	}

	m.thisMenu = ["Chat", [
		["Hide", m.toggleChat],
	] ];
	m.addMenu(m.thisMenu);

	//// spam chat with some messages for testing

	// function getRandom(min, max) {
	// 	return Math.round(Math.random() * (max - min) + min);
	// }
	// function makeRandomName() {
	// 	let length = getRandom(5,15);
	// 	let name = '';
	// 	for (let i=0; i<length; i++) {
	// 		name += String.fromCharCode(getRandom(65, 90));
	// 	}
	// 	return name;
	// }
	// setInterval(function() {
	// 	let rndID = Math.floor(Math.random()*10);
	// 	let rndUID = Math.floor(Math.random()*10000);
	// 	let rndName = makeRandomName();
	// 	let data = {
	// 		type: "chat",
	// 		id: rndID,
	// 		userid: rndUID,
	// 		username: rndName,
	// 		content: "Hello t|here, this is just a test to mak|e sure scrolling works pr|operly"
	// 	}
	// 	m.addMessage(null, data);
	// }, 1000);

}
