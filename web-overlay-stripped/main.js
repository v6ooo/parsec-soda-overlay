"use strict";
const o = {};
o.gamepadLimit = 3; // 0-3
o.loadTheseJS = [
	"../config",
];
o.loadTheseModules = [
	"newmenu",
	"playerscreen",
	"websocket",
	"websocketchat",
	"websocketnametag",
];

{
	let fileName = document.currentScript.src.replace(/.+\/(.+\.\w+)/, "$1");
	console.log("Load: %s", fileName);
	o.temporaryTimeStamp = 0;
	document.currentScript.addEventListener("load", event => {
		o.temporaryTimeStamp = event.timeStamp;
		console.log("Loaded "+ fileName +" after "+ event.timeStamp +" ms");
	});

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
			console.log(arguments);
			var string = msg.toLowerCase();
			var substring = "script error";
			if (string.indexOf(substring) > -1){
				o.status.innerHTML += `Script Error: ${url}\n`;
			}
			else {
				let message = `${url} - ${lineNo}:${columnNo} - ${msg}\n`;
				o.status.innerHTML += message;
			}
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
		// if (o.module.menu) {
		// 	o.module.menu.add(ma);
		// }
		if (o.module.newmenu) {
			o.module.newmenu.add(ma);
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
