/*

z-index

playerscreen		10-30
websocketnametag	40
chatwheel			50-53
websocketpoll		60
websocketchat		70
newmenu				100-102

*/
"use strict";
const o = {};
o.gamepadLimit = 3; // 0-3
o.loadTheseJS = [
	"../config",
	// "gamepad/xbox",
];
o.loadTheseModules = [
	"menu",
	"localplayer",
	"playerscreen",
	"chatwheel",
	// "controls",
	"websocket",
	"websocketchat",
	"websocketnametag",
	// "websocketusers",
	// "text",
	"websocketpoll",
];

{
	let fileName = document.currentScript.src.replace(/.+\/(.+\.\w+)/, "$1");
	console.log("Loading up to: %s", fileName);
	o.temporaryTimeStamp = 0;
	document.currentScript.addEventListener("load", event => {
		o.temporaryTimeStamp = event.timeStamp;
		console.log("Loaded "+ fileName +" after "+ event.timeStamp +" ms");
	});

	o.getModule = function(name) {
		if (o.module[name]) return o.module[name];
		return null;
	}

	o.changeColorBrightness = function(hex, lum) {
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lum = lum || 0;
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}
		return rgb;
	}

	o.makeDraggable = function(element) {
		let pos1 = 0
		let pos2 = 0
		let pos3 = 0
		let pos4 = 0;
		element.onmousedown = dragMouseDown;

		function dragMouseDown(e) {
			if (e.button == 2) {
				element.style.top =  null;
				element.style.left =  null;
			}
			else {
				e = e || window.event;
				e.preventDefault();
				// get the mouse cursor position at startup:
				pos3 = e.clientX;
				pos4 = e.clientY;
				document.onmouseup = closeDragElement;
				document.onmousemove = elementDrag;
			}
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();

			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;

			let newT = element.offsetTop - pos2;
			let newL = element.offsetLeft - pos1;

			// prevent dragging offscreen
			if (newT+element.offsetHeight > window.innerHeight) newT = window.innerHeight - element.offsetHeight -1;
			if (newT < 1) newT = 1;
			if (newL+element.offsetWidth > window.innerWidth) newL = window.innerWidth - element.offsetWidth -1;
			if (newL < 1) newL = 1;

			element.style.top = newT + "px";
			element.style.left = newL + "px";
		}

		function closeDragElement() {
			document.onmouseup = null;
			document.onmousemove = null;
		}

	}

	o.escapeHtml = function(text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&apos;'
		};
		return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}

	o.init = function() {
		o.container = document.createElement('div');
		document.body.appendChild(o.container);
		o.container.id = 'container';

		o.module = {};
		o.p = { // profile object
			disable: []
		};
		o.profile = [];
		o.profileSelected = null;
		o.svg = { xbox: { } };

		// Display error messages on screen so we can't miss anything
		o.status = document.createElement("div");
		o.status.id = "status";
		document.body.appendChild(o.status);
		window.onerror = function (msg, url, lineNo, columnNo, error) {
			url = url.replace(/.+\/(.+)\.\w+/, "$1");
			var string = msg.toLowerCase();
			var substring = "script error";
			// if (string.indexOf(substring) > -1){
			// 	o.status.innerHTML += `Script Error: ${url}\n`;
			// }
			// else {
				let message = `${url} - ${lineNo}:${columnNo} - ${msg}\n`;
				o.status.innerHTML += message;
			// }
			return false;
		};

		// Create loading animation
		let l = document.createElement("div");
		l.id = "loading";
		document.body.appendChild(l);

		l.border = document.createElement("div");
		l.appendChild(l.border)
		l.border.className = "loadingborder";

		l.bar = document.createElement("div");
		l.border.appendChild(l.bar)
		l.bar.className = "loadingbar";
		l.bar.style.width = "0%"; // 5

		l.text = document.createElement("div");
		l.border.appendChild(l.text)
		// l.bar.appendChild(l.text)
		l.text.className = "loadingtext";

		o.loading = l;

		o.loadFiles();
	}


	// Loading functions
	o.loadJS = function(file) {
		console.log(`Load: ${file}`)
		let s = document.createElement("script");
		s.src = file;
		document.head.appendChild(s);
		return s;
	};

	o.loadFiles = function() {
		let files = [];
		let duration = [ o.temporaryTimeStamp ];
		let lastDuration = o.temporaryTimeStamp;
		let currentFile = "";
		// var fileIterator = files[Symbol.iterator]();
		for (let file of o.loadTheseJS) {
			files.push(`${file}.js`);
		}
		for (let file of o.loadTheseModules) {
			files.push(`modules/${file}.js`);
		}

		function makeIterator(array) {
			let nextIndex = 0
			return {
				next: function() {
					return nextIndex < array.length ? {
						index: nextIndex,
						value: array[nextIndex++],
						done: false,
					} : {
						done: true
					};
				}
			};
		}

		let fileIterator = makeIterator(files);

		function loadCallback(event) {
			let d = event.timeStamp - lastDuration;
			duration.push(d);
			let text = currentFile +" in "+ d +" ms";
			if (event.type == "error") text = "Error loading "+ text;
			else text = "Loaded "+ text;
			console.log(text);
			lastDuration = event.timeStamp;
			next();
		}

		function end() {
			let total = duration.reduce( (p,c) => p+c );
			console.log("Loaded everything in "+ total +" ms");
			// setTimeout(()=>{
				o.loading.style.display = "none";
			// },500);
			if (config.defaultScale) {
				document.body.style.fontSize = config.defaultScale +"%";
			}
		}

		function next() {
			let it = fileIterator.next();
			if (it.done) end();
			else {
				currentFile = it.value;
				o.loading.text.innerHTML = currentFile;
				o.loading.bar.style.width = ((it.index+1) / files.length * 100) +"%";
				let s = o.loadJS(it.value);
				s.addEventListener("load", loadCallback);
				s.addEventListener("error", loadCallback);
			}
		}

		next();
	}

	// Run when page finish loading
	window.addEventListener("load", o.init);

}

class Profile {
	constructor(name) {
		this.fileName = document.currentScript.src.replace(/.+\/(.+)\.\w+/, "$1");
		let sf = decodeURIComponent(this.fileName).replace(/[^ a-z0-9]+/gi, "");
		this.name = name || sf;
		// this.displayName = 
		o.profile.push(this);
	}
}

class Module {
	constructor() {
		this.name = document.currentScript.src.replace(/.+\/(.+)\.\w+/, "$1");
		o.module[this.name] = this;
		this.rafInterval = 50; // 100=10fps, 50=20fps, 33.3=30fps, 16.6=60fps
		this.rafLast = 0;
		this.profileRebuild = false;
		this.enabled = true;
	}
	enable() {
		this.enabled = true;
	}
	disable() {
		this.enabled = false;
	}
	// toggle() {
	// 	this.enabled = !this.enabled;
	// 	return this.enabled;
	// }
	loadCSS() {
		// let rnd = Math.floor(Math.random()*1000);
		let c = document.createElement("link");
		c.rel = "stylesheet";
		c.type = "text/css";
		c.href = `modules/${this.name}.css`;
		document.head.appendChild(c);
	}
	createContainer() {
		this.container = document.createElement("div");
		this.container.id = this.name;
		o.container.appendChild(this.container);
	}
	addMenu(ma) {
		if (o.module.menu) {
			o.module.menu.add(ma);
		}
	}
	lock(state) {
		if (typeof state == "undefined") {
			let cl = o.lockedTo;
			if (!cl || cl == this.name) return false;
			else return true;
		}
		else if (state == false) {
			o.lock(false)
		}
		else if (state == true) {
			o.lock(this.name);
		}
	}
}
