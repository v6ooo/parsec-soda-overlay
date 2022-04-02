"use strict";
{
	let m = new Module();
	m.loadCSS();

	m.showUserid = false;
	let oldMetrics = {};
	let nametags = [];

	m.toggle = function() {
		this.status = !this.status;
		this.innerHTML = (!this.status) ? 'Hide' : 'Show';
		let newStyle = (!this.status) ? 'visible' : 'hidden';
		// m.container.style.visibility = newStyle;
		for (let n of nametags) {
			n.style.visibility = newStyle;
		}
	}

	m.thisMenu = ["Nametags", [
		["Hide", m.toggle],
		["4P Close (default)", "o.module.websocketnametag.setPos(this,'default')"],
		["4P Corners", "o.module.websocketnametag.setPos(this,'corners')"],
		["Top right", "o.module.websocketnametag.setPos(this,'topright')"],
	] ];
	m.addMenu(m.thisMenu);

	m.setPos = function(_this, position) {
		let newClass;
		switch(position) {
			case "topright":
				newClass = "topright";
				break;
			case "corners":
				newClass = "corners";
				break;
			case "default":
			default:
				newClass = "default";
				break;
		}
		for (let n of nametags) {
			n.className = 'nametag '+newClass;
		}
	}

	for (let i=0; i<o.module.playerscreen.playerScreens.length; i++) {
		let n = document.createElement('div');
		let p = document.getElementById('p'+i);
		p.appendChild(n);
		p.nametag = n;
		n.id = 'nt'+i;
		n.className = 'nametag default';
		n.useridElement = document.createElement('div');
		n.useridElement.className = 'userid';
		n.appendChild(n.useridElement);
		n.usernameElement = document.createElement('div');
		n.usernameElement.className = 'username';
		n.appendChild(n.usernameElement);
		n.latencyElement = document.createElement('div');
		n.latencyElement.className = 'latency';
		n.appendChild(n.latencyElement);
		nametags.push(n);
	}

	// avoid changing html/dom unless there's something to change
	let setText = function(element, text) {
		// if (element.innerText != text) element.innerText = text;
		if (element.innerHTML != text) element.innerHTML = text;
	}

	m.updateNametags = function(event, data) {
		// clear old saved metrics on disconnect
		if (data.type == "gueststate" && data.state == 8 && oldMetrics[data.id]) {
			delete oldMetrics[data.id];
		}
		for (let nametag of nametags) {
			let playerIndex = nametag.parentNode.playerIndex;
			let gp = o.ws.gamepads[playerIndex];
			if (gp && gp.id) {
				nametag.style.visibility = "visible";
				nametag.parsecid = gp.id;
				nametag.userid = gp.userid;
				nametag.username = gp.username;
				setText(nametag.usernameElement, gp.username);
				if (m.showUserid) setText(nametag.useridElement, "#"+gp.userid);
				let g = o.ws.guests.find(guest => guest.id == gp.id);
				if (gp.localplayer) nametag.latencyElement.innerText = "";
				else if (!g) nametag.latencyElement.innerHTML = "&nbsp;";
				else {
					let classColor = 'latency';
					let lat = Math.floor(g.metrics.networkLatency) +"ms";
					// if (g.metrics.networkLatency > 200) {
					// 	// ⚠️🐢🐌
					// 	lat = `<span class="em">🐌</span>` + lat;
					// }	
					setText(nametag.latencyElement, lat);
					if (oldMetrics[g.id]) {
						if (g.metrics.slowRTs > oldMetrics[g.id].slowRTs) classColor += ' slowrt';
						else if (g.metrics.fastRTs > oldMetrics[g.id].fastRTs) classColor += ' fastrt';
					}
					if (nametag.latencyElement.className != classColor) nametag.latencyElement.className = classColor;        
					oldMetrics[g.id] = g.metrics;
				}
			}
			else {
				nametag.style.visibility = "hidden";
				nametag.parsecid = 0;
				nametag.userid = 0;
				nametag.username = "";
				setText(nametag.usernameElement, "");
				setText(nametag.useridElement, "");
				setText(nametag.latencyElement, "");
			}

		}
	}

	o.ws.addHook("gamepadall", m.updateNametags);
	o.ws.addHook("gamepadconnect", m.updateNametags);
	o.ws.addHook("gamepadassign", m.updateNametags);
	o.ws.addHook("gamepadstrip", m.updateNametags);
	o.ws.addHook("gamepadmove", m.updateNametags);
	o.ws.addHook("gueststate", m.updateNametags);

}
