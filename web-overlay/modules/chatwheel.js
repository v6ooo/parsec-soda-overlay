"use strict";
{
	let m = new Module();
	m.loadCSS();

	// ["Yes", "Item", "Here", "Stop", "No", "GG", "Thanks", "Sorry"]
	// ["Nice","LOL","Oof","Oh No","🦆","GG","Wow","Aw Yeah"]
	// 😡🤬✔️❌☹️😑🤝

	let emoteOptions = [
		[
			'🤯',
			'👋',
			'😭',
			'👎',
			'🤬',
			'👍',
			'🤣',
			'👏',
		],
		[
			'🤔',
			'🙏',
			'🥺',
			'🔥',
			'💀',
			'😊',
			'😍',
			'💪',
		],
	]
	m.switchButton = [11];
	m.triggerDistance = 0.6;
	m.chatwheels = [];
	m.showButton = [];
	m.selectButton = [10];
	m.selectType = 0;
	m.currentLayout = null;
	
	m.setSelectType = function() {
		if (m.showButton.length > 0) m.selectType = 1;
		else m.selectType = 0;
	}

	m.setPosReset = function() {
		for (let w of m.chatwheels) {
			w.emotePopup.className = "selectedemote";
			w.wheel.className = "selectwheel";
		}
	}

	m.setPos = function(both, flipVert, flipHori, forceVert, forceHori, skipVert, skipHori) {
		m.currentLayout = [ both, flipVert, flipHori, forceVert, forceHori, skipVert, skipHori ];
		let vertMult = flipVert ? -1 : 1;
		let horiMult = flipHori ? -1 : 1;
		m.setPosReset();
		let center = [window.innerWidth/2, window.innerHeight/2];
		let gmod = o.getModule("playerscreen");
		for (let w of gmod.windows) {
			let e = w.getElementsByClassName("selectedemote")[0];
			let s = w.getElementsByClassName("selectwheel")[0];
			if (e) {
				let windowVert = ((w.offsetTop+(w.offsetHeight/2)) - center[1]) * vertMult;
				let windowHori = ((w.offsetLeft+(w.offsetWidth/2)) - center[0]) * horiMult;
				if (forceVert < 0 || forceVert > 0) windowVert = forceVert *10;
				if (forceHori < 0 || forceHori > 0) windowHori = forceHori *10;
				let styleVert = windowVert < 0 ? "bottom" : "top";
				let styleHori = windowHori < 0 ? "right" : "left";
				console.log("%d    %d", windowVert, windowHori);
				if (!skipVert && Math.abs(windowVert) > 5) e.classList.add(styleVert);
				if (!skipHori && Math.abs(windowHori) > 5) e.classList.add(styleHori);
				if (both) {
					if (!skipVert && Math.abs(windowVert) > 5) s.classList.add(styleVert);
					if (!skipHori && Math.abs(windowHori) > 5) s.classList.add(styleHori);
				}
			}
		}
	}

	m.setPosResetSingle = function(w) {
		let e = w.getElementsByClassName("selectedemote")[0];
		let s = w.getElementsByClassName("selectwheel")[0];
		e.classList.remove("top", "bottom", "left", "right");
		s.classList.remove("top", "bottom", "left", "right");
	}

	m.setPosSingle = function(windowDom, both, flipVert, flipHori, forceVert, forceHori, skipVert, skipHori) {
		if (!m.currentLayout) return;
		[both, flipVert, flipHori, forceVert, forceHori, skipVert, skipHori] = m.currentLayout;
		let vertMult = flipVert ? -1 : 1;
		let horiMult = flipHori ? -1 : 1;
		m.setPosReset();
		let center = [window.innerWidth/2, window.innerHeight/2];
		let gmod = o.getModule("playerscreen");
		for (let w of gmod.windows) {
			let e = w.getElementsByClassName("selectedemote")[0];
			let s = w.getElementsByClassName("selectwheel")[0];
			if (e) {
				let windowVert = ((w.offsetTop+(w.offsetHeight/2)) - center[1]) * vertMult;
				let windowHori = ((w.offsetLeft+(w.offsetWidth/2)) - center[0]) * horiMult;
				if (forceVert < 0 || forceVert > 0) windowVert = forceVert *10;
				if (forceHori < 0 || forceHori > 0) windowHori = forceHori *10;
				let styleVert = windowVert < 0 ? "bottom" : "top";
				let styleHori = windowHori < 0 ? "right" : "left";
				if (!skipVert && Math.abs(windowVert) > 5) e.classList.add(styleVert);
				if (!skipHori && Math.abs(windowHori) > 5) e.classList.add(styleHori);
				if (both) {
					if (!skipVert && Math.abs(windowVert) > 5) s.classList.add(styleVert);
					if (!skipHori && Math.abs(windowHori) > 5) s.classList.add(styleHori);
				}
			}
		}
	}

	m.setShowButton = function(b) {
		m.showButton = b;
		for (let button of b) {
			let f = m.switchButton.indexOf(button);
			if (f != -1) m.switchButton.splice(f, 1);
		}
		m.setSelectType();
	}
	m.setSelectButton = function(b) {
		m.selectButton = b;
		m.setSelectType();
	}
	m.setSwitchButton = function(b) {
		for (let c of m.chatwheels) {
			c.emoteOptions = emoteOptions[0];
			c.setEmotes();
			c.setPositions();
		}
		m.switchButton = b;
		for (let button of b) {
			let f = m.showButton.indexOf(button);
			if (f != -1) m.showButton.splice(f, 1);
			f = m.selectButton.indexOf(button);
			if (f != -1) m.selectButton.splice(f, 1);
		}
		m.setSelectType();
	}


	m.changeSize = function(newSize) {
		for (let c of m.chatwheels) {
			c.container.style.fontSize = newSize +"%";
		}
	}

	m.toggle = function() {
		this.innerHTML = (m.enabled) ? 'Turn ON' : 'Turn OFF';
		m.enabled = !m.enabled;
		for (let c of m.chatwheels) {
			if (m.enabled) c.wheel.style.display = "block";
			else c.wheel.style.display = "none";
		}
		if (m.enabled) requestAnimationFrame(m.update);
	}

	m.add = function() {
		if (m.chatwheels.length < 4) {
			m.chatwheels.push(new Chatwheel());
		}
	}

	m.remove = function() {
		let gmod = o.getModule("playerscreen");
		if (m.chatwheels.length > gmod.windows.length) {
			let dead = m.chatwheels.pop();
			dead.container.remove();
			dead.container = null;
		}
	}

	m.update = function(timestamp) {
		if (!m.enabled) return;
		if (timestamp - m.rafLast >= m.rafInterval) {
			for (let c of m.chatwheels) {
				c.update(timestamp);
			}
			m.rafLast = timestamp;
		}
		requestAnimationFrame(m.update);
	}

	class Chatwheel {
		parent = null;
		container = null;
		wheel = null;
		selected = null;
		prevSelected = null;
		emotes = [];
		emotePopup = null;
		showTimer = null;
		locked = false;
		wheelRadius = 2.1; // 100
		showDuration = 5000;
		switchButtonRelease = null;
		selectButtonRelease = null;

		constructor() {
			let gmod = o.getModule("playerscreen");
			this.parent = gmod.windows[m.chatwheels.length];

			this.container = document.createElement("div");
			this.container.className = "chatwheel";
			this.parent.appendChild(this.container);

			this.wheel = document.createElement('div');
			this.container.appendChild(this.wheel);
			this.wheel.className = 'selectwheel';

			this.emotePopup = document.createElement('div');
			this.emotePopup.className = 'selectedemote size100';
			this.container.appendChild(this.emotePopup);

			this.emoteOptions = emoteOptions[0];
			this.emoteOptionsActive = 0;

			this.setEmotes();
			this.setPositions();
		}

		setEmotes() {
			this.wheel.innerHTML = "";
			this.emotes = [];

			this.wheelRadius = this.emoteOptions.length * 0.25;

			for (let i=0; i<this.emoteOptions.length; i++) {
				let emote = document.createElement('div');
				emote.className = "emote";
				this.wheel.appendChild(emote);
				this.emotes.push(emote);
				let icon = document.createElement('div');
				emote.icon = icon;
				emote.appendChild(icon);
				if (Array.isArray(this.emoteOptions[i])) {
					icon.style.position = 'relative';
					icon.style.left = this.emoteOptions[i][1] +'px';
					icon.style.top = this.emoteOptions[i][2] +'px';
					icon.innerHTML = this.emoteOptions[i][0];
				}
				else {
					if (this.emoteOptions[i].length > 2) {
						emote.className += " text";
					}
					icon.innerHTML = this.emoteOptions[i];
				}

			}
		}

		setPositions() {
			for (let i=0; i<this.emotes.length; i++) {

				let eco = (360/this.emotes.length);
				// let next = ((eco*i)-90) + (eco/2) -22.5;
				let next = ((eco*i)-90) + (eco/2) - (360/this.emotes.length/2);

				// let px = Math.floor( this.wheelRadius * Math.cos( next*(Math.PI/180) ) );
				// let py = Math.floor( this.wheelRadius * Math.sin( next*(Math.PI/180) ) );
				let px = Math.cos( next*(Math.PI/180) );
				let py = Math.sin( next*(Math.PI/180) );

				let vertMult = 1;
				if (this.emotes[i].icon.innerHTML.length > 2) {
					py = py * Math.abs(py) * 1.2;
					px = px * 2;
				}

				// this.emotes[i].style.left = px +'px';
				// this.emotes[i].style.top = py +'px';
				this.emotes[i].style.left = (this.wheelRadius * px) +'em';
				this.emotes[i].style.top = (this.wheelRadius * py) +'em';
			}
		}

		showEmote() {
			this.locked = true;
			if (Array.isArray(this.emoteOptions[this.selected])) {
				this.emotePopup.innerHTML = this.emoteOptions[this.selected][0];
			}
			else {
				this.emotePopup.innerHTML = this.emoteOptions[this.selected];
			}
			this.wheel.style.visibility = 'hidden';
			this.emotePopup.style.visibility = 'visible';
			clearTimeout(this.showTimer);
			this.showTimer = setTimeout(() => {
				this.hideEmote();
			}, this.showDuration);
		}

		hideEmote() {
			this.emotePopup.style.visibility = 'hidden';
		}

		update(timestamp) {
			if (this.parent.browserIndex == null) return;
			let g = navigator.getGamepads()[this.parent.browserIndex];
			if (!g) return;

			for (let b of m.switchButton) {
				if (g.buttons[b].pressed) {
					this.switchButtonRelease = b;
					break;
				}
			}
			if (this.switchButtonRelease && !g.buttons[this.switchButtonRelease].pressed) {
				this.switchButtonRelease = null;

				this.emoteOptionsActive++;
				if (this.emoteOptionsActive >= emoteOptions.length) {
					this.emoteOptionsActive = 0;
				}

				this.emoteOptions = emoteOptions[this.emoteOptionsActive];
				this.setEmotes();
				this.setPositions();
			}

			let x = g.axes[2];
			let y = -g.axes[3];
			let wheelOffset = -22.5;
			let angle = Math.atan2( x, y );
			let degrees = angle / (Math.PI / 180 ) - wheelOffset;
			let co = (360+Math.round(degrees))%360;
			let distance = Math.sqrt( x*x + y*y );
			if (this.locked) {
				if (distance < 0.2) this.locked = false;
				return;
			}
			let show = false;
			if (m.selectType == 1) {
				for (let b of m.showButton) {
					if (g.buttons[b].pressed) {
						show = true;
						break;
					}
				}
			}
			else if (distance > m.triggerDistance) {
				show = true;
			}
			if (show) {
				if (distance > m.triggerDistance) this.selected = Math.floor( co / (360 / this.emoteOptions.length ) );
				this.wheel.style.visibility = 'visible';
			}
			else {
				if (m.selectType == 0) this.selected = null;
				this.wheel.style.visibility = 'hidden';
			}
			if (this.selected != null) {
				if (distance <= m.triggerDistance) {
					this.selected = null;
					return;
				}
				if (this.selected != this.prevSelected) {
					if (this.prevSelected != null) {
						this.emotes[this.prevSelected].classList.remove("selected");
					}
					this.prevSelected = this.selected;
				}
				this.emotes[this.selected].classList.add("selected");
				let activate = false;
				if (m.selectType == 1) {
					for (let b of m.selectButton) {
						if (g.buttons[b].pressed && m.switchButton.indexOf(b) == -1) {
							this.selectButtonRelease = b;
							break;
						}
					}
					if (this.selectButtonRelease && !g.buttons[this.selectButtonRelease].pressed) {
						this.selectButtonRelease = null;
						activate = true;
					}
				}
				else {
					for (let b of m.selectButton) {
						if (g.buttons[b].pressed && m.switchButton.indexOf(b) == -1) {
							activate = true;
							break;
						}
					}
				}
				if (activate) {
					this.showEmote();
				}
			}
			else {
				if (this.prevSelected != null) {
					this.emotes[this.prevSelected].classList.remove("selected");
					this.prevSelected = null;
				}
			}
		}

	}

	m.init = function() {
		m.setSelectType();
		let gmod = o.getModule("playerscreen");
		for (let i=0; i<gmod.windows.length; i++) {
			m.add();
		}

		gmod.addCallback(m.add);
		gmod.removeCallback(m.remove);
		gmod.moveCallback(m.setPosSingle);
		requestAnimationFrame(m.update);
	}
	m.init();

	let sizes = [50, 75, 100];
	let sizeMenu = [];
	for (let s of sizes) {
		sizeMenu.push([s+"%", m.changeSize, s]);
	}

	// both, flipVert, flipHori, forceVert, forceHori, skipVert, skipHori

	m.thisMenu = ["Chat Wheel",[
		["Turn OFF", m.toggle],
		["Position",
			[
				["Reset (center)", m.setPosReset],
				["Both",
					[
						["Top Right", m.setPos, 1, 0, 0, 1, -1],
						["Top Right & Bottom Right", m.setPos, 1, 1, 0, 0, -1],
						["Top", m.setPos, 1, 1, 0, 1, 0, 0, 1],
						["Bottom", m.setPos, 1, 1, 0, -1, 0, 0, 1],
						["Towards Center", m.setPos, 1],
						["Outer Center", m.setPos, 1, 1],
						["Outer Corners", m.setPos, 1, 1, 1],
					]
				],
				["Selected emote",
					[
						["Top Right", m.setPos, 0, 0, 0, 1, -1],
						["Top Right & Bottom Right", m.setPos, 0, 1, 0, 0, -1],
						["Top", m.setPos, 0, 1, 0, 1, 0, 0, 1],
						["Bottom", m.setPos, 0, 1, 0, -1, 0, 0, 1],
						["Towards Center", m.setPos, 0],
						["Outer Center", m.setPos, 0, 1],
						["Outer Corners", m.setPos, 0, 1, 1],
					]
				]
			]
		],
		["Size", sizeMenu],
		["Trigger",
			[
				["Show",
					[
						["Move Right stick", m.setShowButton, []],
						["Press Right stick", m.setShowButton, [11]],
						["Press Left stick", m.setShowButton, [10]],
					]
				],
				["Activate",
					[
						["Press Any stick", m.setSelectButton, [10,11]],
						["Press Right stick", m.setSelectButton, [11]],
						["Press Left stick", m.setSelectButton, [10]],
					]
				],
				["Switch wheel",
					[
						["Disabled", m.setSwitchButton, []],
						["Press Right stick", m.setSwitchButton, [11]],
						["Press Left stick", m.setSwitchButton, [10]],
					]
				],
			]
		],
	]];
	m.addMenu(m.thisMenu);

}
