"use strict";
{
	let m = new Module();
	m.loadCSS();

	m.showUserid = false;
	let oldMetrics = {};

	m.nametags = [];

	m.toggle = function() {
		this.innerHTML = (m.enabled) ? 'Turn ON' : 'Turn OFF';
		m.enabled = !m.enabled;
		if (!m.enabled) {
			for (let n of m.nametags) {
				n.clear();
			}
		}
	}

	m.setPosReset = function() {
		for (let n of m.nametags) {
			n.dom.className = "nametag";
		}
	}

	m.setPosCenter = function(flipVert, flipHori, forceVert, forceHori, skipVert, skipHori) {
		let vertMult = flipVert ? -1 : 1;
		let horiMult = flipHori ? -1 : 1;
		m.setPosReset();
		let center = [window.innerWidth/2, window.innerHeight/2];
		for (let w of o.module.playerscreen.windows) {
			let e = w.getElementsByClassName("nametag")[0];
			if (e) {
				let windowVert = ((w.offsetTop+(w.offsetHeight/2)) - center[1]) * vertMult;
				let windowHori = ((w.offsetLeft+(w.offsetWidth/2)) - center[0]) * horiMult;
				if (forceVert < 0 || forceVert > 0) windowVert = forceVert *10;
				if (forceHori < 0 || forceHori > 0) windowHori = forceHori *10;
				let styleVert = windowVert < 0 ? "bottom" : "top";
				let styleHori = windowHori < 0 ? "right" : "left";
				if (!skipVert && Math.abs(windowVert) > 1) e.classList.add(styleVert);
				if (!skipHori && Math.abs(windowHori) > 1) e.classList.add(styleHori);
			}
		}
	}

	class Nametag {
		constructor() {

			this.parent = o.module.playerscreen.windows[m.nametags.length]

			let n = document.createElement("div");
			// n.className = "nametag topright";
			n.className = "nametag";
			if (config.defaultNametagPosition) n.className += " "+config.defaultNametagPosition;
			else n.className += " top right";

			n.useridElement = document.createElement('div');
			n.useridElement.className = 'userid';
			n.appendChild(n.useridElement);
			n.usernameElement = document.createElement('div');
			n.usernameElement.className = 'username';
			n.appendChild(n.usernameElement);
			n.latencyElement = document.createElement('div');
			n.latencyElement.className = 'latency';
			n.appendChild(n.latencyElement);

			this.parent.appendChild(n);
			m.nametags.push(this);
			this.dom = n;
		}
		clear() {
			setVisible(this.dom, false);
			setText(this.dom.usernameElement, "");
			setText(this.dom.latencyElement, "");
		}
		update() {
			let sodaIndex = this.dom.parentNode.sodaIndex;
			let gamepad = o.ws.gamepads[sodaIndex];
			if (!gamepad || !gamepad.id) {
				this.clear()
				return;
			}
			let g = o.ws.guests.find(guest => guest.id == gamepad.id);
			if (!g) {
				this.clear();
				return;
			}
			setVisible(this.dom, true);
			setText(this.dom.usernameElement, gamepad.username);
			if (g.localplayer) {
				setText(this.dom.latencyElement, "");
			}
			else {
				let lat = Math.floor(g.metrics.networkLatency) +"ms";
				let classColor = 'latency';
				// if (g.metrics.networkLatency > 200) {
				// 	// ⚠️🐢🐌
				// 	lat = `<span class="em">🐌</span>` + lat;
				// }
				setText(this.dom.latencyElement, lat);
				if (oldMetrics[g.id]) {
					if (g.metrics.slowRTs > oldMetrics[g.id].slowRTs) classColor += ' slowrt';
					else if (g.metrics.fastRTs > oldMetrics[g.id].fastRTs) classColor += ' fastrt';
				}
				if (this.dom.latencyElement.className != classColor) this.dom.latencyElement.className = classColor;        
				oldMetrics[g.id] = g.metrics;
			}
		}
	}

	m.add = function() {
		if (m.nametags.length < o.module.playerscreen.windows.length) {
			new Nametag();
		}
	}

	// Remove last nametag
	m.remove = function() {
		let dead = m.nametags.pop();
		dead.dom.remove();
		dead.dom = null;
	}

	// Remove all nametags without parents
	m.removeDead = function() {
		console.log("ns "+ m.nametags.length);
		for (let i=m.nametags.length-1; i>=0; i--) {
			if (!m.nametags[i].dom.parentNode.parentNode) {
				m.nametags[i].dom.remove();
				m.nametags[i].dom = null;
				m.nametags.splice(i, 1);
			}
		}
	}

	let setVisible = function(element, state) {
		let style = state ? "visible" : "hidden";
		if (element.style.visibility != style) element.style.visibility = style;
	}

	let setText = function(element, text) {
		if (element.innerHTML != text) element.innerHTML = text;
	}

	m.updateNametags = function(event, data) {
		// clear old saved metrics on disconnect
		if (data.type == "gueststate" && data.state == 8 && oldMetrics[data.id]) {
			delete oldMetrics[data.id];
		}
		if (m.enabled) {
			for (let n of m.nametags) {
				n.update();
			}
		}
	}

	o.ws.addHook("gamepadall", m.updateNametags);
	o.ws.addHook("gamepadconnect", m.updateNametags);
	o.ws.addHook("gamepadassign", m.updateNametags);
	o.ws.addHook("gamepadstrip", m.updateNametags);
	o.ws.addHook("gamepadmove", m.updateNametags);
	o.ws.addHook("gueststate", m.updateNametags);

	m.init = function() {
		for (let i=0; i<o.module.playerscreen.windows.length; i++) {
			m.add();
		}
		o.module.playerscreen.addCallback(m.add);
		o.module.playerscreen.removeCallback(m.remove);
	}
	m.init();

	m.thisMenu = ["Nametags", [
		["Turn OFF", m.toggle],
		["Position", [
			["Top Right", m.setPosCenter, 0, 0, 1, -1],
			["Top Right & Bottom Right", m.setPosCenter, 1, 0, 0, -1],
			["Top", m.setPosCenter, 1, 0, 1, 0, 0, 1],
			["Bottom", m.setPosCenter, 1, 0, -1, 0, 0, 1],
			["Towards Center", m.setPosCenter],
			["Outer Center", m.setPosCenter, 1],
			["Outer Corners", m.setPosCenter, 1, 1],
		]],
	]];
	m.addMenu(m.thisMenu);

}
