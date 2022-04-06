"use strict";
{
	let defaultAmount = config.defaultWindowAmount;

	let m = new Module();
	m.createContainer();
	m.container.style.position = 'absolute';
	m.container.style.top = '0';
	m.container.style.left = '0';
	m.container.style.display = 'flex';
	m.container.style.flexWrap = 'wrap';
	m.container.style.width = '100%';
	m.container.style.height = '100%';
    m.container.style.justifyContent = "center";
    m.container.style.alignContent = "center";

	m.resizeLast = [window.innerWidth, window.innerHeight];
	m.isLocked = true;
	m.windows = [];
	m.zIndex = [];

	m.layouts = [
		[1,  [ [1,1] ]],
		[2,  [ [1,2], [2,1] ]],
		[3,  [ [2,2], [3,1] ]],
		[4,  [ [2,2], [4,1] ]],
		[5,  [ [3,2], [5,1] ]],
		[6,  [ [3,2], [6,1] ]],
		[8,  [ [4,2], [8,1] ]],
		[9,  [ [3,3] ]],
		[16, [ [4,4] ]],
	];

	m.currentLayout = [];
	let find = m.layouts.find(l => l[0] == defaultAmount);
	if (find) m.currentLayout = find[1][0];
	else m.layouts[0][1][0];

	let windowsMenu = [];

	m.addCallbacks = [];
	m.removeCallbacks = [];

	m.addCallback = function(func) {
		m.addCallbacks.push(func);
	}
	m.removeCallback = function(func) {
		m.removeCallbacks.push(func);
	}

	m.changeAmount = function(amount) {
		if (amount < m.windows.length) {
			for (let i=m.windows.length; i>amount; i--) {
				m.remove();
			}
			m.organize();
		}
		else {
			for (let i=m.windows.length; i<amount; i++) {
				m.add();
			}
		}

		if (!m.isLocked) {
			m.showWindows();
		}
	}

	m.changeLayout = function(amount, layout) {
		m.currentLayout = layout;
		m.changeAmount(amount);
		m.organize();
	}

	function createSVG(amount, layout, size) {
		let playerColors = ["#F52E2E", "#5463FF", "#FFC717", "#1F9E40", "#FF6619", "#24D4C4", "#D41CE5", "#4A4559"];
		let svg = [];
		svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}" viewBox="0 0 ${size[0]} ${size[1]}">`);
		svg.push(`<rect x="0" y="0" width="${size[0]}" height="${size[1]}" fill="#010101" />`);
		let ww = size[0] / layout[0];
		let wh = size[1] / layout[1];
		for (let i=0; i<amount; i++) {
			let top = Math.floor(i / layout[0]);
			let left = i % layout[0];
			let posTop = top*wh;
			let posLeft = left*ww;
			let color = playerColors[i%(playerColors.length)];
			svg.push(`<rect x="${posLeft}" y="${posTop}" width="${ww}" height="${wh}" stroke-width="3" stroke="#000" fill="${color}" />`);
		}
		svg.push(`</svg>`);
		return svg.join();
	}

	for (let p of m.layouts) {
		let array = [p[0], []];
		for (let l of p[1]) {
			array[1].push( [ createSVG(p[0], l, [80, 45]), m.changeLayout, p[0], l ] );
			// array[1].push( [ "test", `fuck` ] );
		}
		windowsMenu.push(array);
	}

	m.organize = function() {
		let col = m.currentLayout[0];
		let row = m.currentLayout[1];
		let ww = Math.floor(window.innerWidth / col);
		let wh = Math.floor(window.innerHeight / row);
		for (let i=0; i<m.windows.length; i++) {
			let w = m.windows[i];
			let top = Math.floor(i / col);
			let left = i % col;
			w.style.top = Math.floor(top*wh) +"px";
			w.style.left = Math.floor(left*ww) +"px";
			w.style.width = ww +"px";
			w.style.height = wh +"px";
		}
	}

	m.add = function(_this) {
		let win = document.createElement("div");
		win.sodaIndex = m.windows.length;
		win.browserIndex = m.windows.length;
		win.className = "playerscreen";
		m.windows.push(win);
		// win.style.display = 'flex';
		// win.style.flexWrap = 'wrap';
		win.style.position = "absolute";
		// default size
		win.style.top = "0px";
		win.style.left = "0px";
		win.style.width = "320px";
		win.style.height = "180px";

		win.style.display = 'flex';
		win.style.flexWrap = "wrap";
		win.style.justifyContent = "center";
		win.style.alignContent = "center";

		// win.style.background = "#036";

		let drag = document.createElement("div");
		drag.className = "drag";
		win.drag = drag;
		win.appendChild(drag);

		let bg = document.createElement("div");
		bg.style.display = "none";
		bg.style.position = "absolute";
		bg.style.top = "0px";
		bg.style.bottom = "0px";
		bg.style.left = "0px";
		bg.style.right = "0px";
		bg.style.border = "2px solid #09F";
		bg.style.zIndex = -1;
		win.bg = bg;
		drag.appendChild(bg);

		let titlebar = document.createElement("div");
		win.titlebar = titlebar;
		titlebar.style.display = "none";
		titlebar.style.position = "absolute";
		titlebar.style.top = "0px";
		titlebar.style.left = "0px";
		titlebar.style.right = "0px";
		titlebar.style.fontSize = "22px";
		// titlebar.style.fontSize = "10px";
		titlebar.style.padding = "2px 2px 0px 10px";
		titlebar.style.background = "#09F9";
		titlebar.style.zIndex = 30;
		titlebar.innerHTML = "Window "+ m.windows.length;
		drag.appendChild(titlebar);

		dragElement(win);
		win.style.cursor = "move";

		m.container.appendChild(win);
		m.organize();

		for (let f of m.addCallbacks) {
			f();
		}
	}

	m.remove = function() {
		let rem = m.windows.pop();
		rem.remove();
		rem = null;
		for (let f of m.removeCallbacks) {
			f();
		}
	}

	window.addEventListener("resize", function(event) {
		let x = Math.abs(m.resizeLast[0] - window.innerWidth);
		let y = Math.abs(m.resizeLast[1] - window.innerHeight);
		if (x+y < 5) return;
		m.resizeLast = [ window.innerWidth, window.innerHeight ];
		m.organize();
	});

	// Put the active window on top of the last
	m.setZIndex = function(win) {
		if (m.zIndex.indexOf(win) == -1) m.zIndex.push(win);
		else if (m.zIndex.length > 1) {
			let removeIndex = m.zIndex.indexOf(win);
			if (removeIndex > -1) {
				m.zIndex.push(m.zIndex.splice(removeIndex, 1)[0]);
			}
		}
		for (let i=0; i<m.zIndex.length; i++) {
			m.zIndex[i].bg.style.zIndex = i + 10;
		}
	}

	m.snapWindows = function(win) {
		let snapDistance = 50;
		let snapVert = false;
		let snapHori = false;
		for (let w of m.windows) {
			if (w == win) continue;
			let distance = 0;
			// Vertical snaps
 			// top to ymin
			distance = Math.abs(0 - win.offsetTop);
			if (!snapVert && distance <= snapDistance) {
				win.style.top = 0 +"px";
				snapVert = true;
			}
			// bottom to ymax
			distance = Math.abs(window.innerHeight - (win.offsetTop + win.offsetHeight));
			if (!snapVert && distance <= snapDistance) {
				win.style.top = (window.innerHeight - win.offsetHeight) +"px";
				snapVert = true;
			}
			// top to top
			distance = Math.abs(w.offsetTop - win.offsetTop);
			if (!snapVert && distance <= snapDistance) {
				win.style.top = w.offsetTop +"px";
				snapVert = true;
			}
			// top to bottom
			distance = Math.abs(w.offsetTop + w.offsetHeight - win.offsetTop);
			if (!snapVert && distance <= snapDistance) {
				win.style.top = (w.offsetTop + w.offsetHeight) +"px";
				snapVert = true;
			}
			// bottom to top
			distance = Math.abs(w.offsetTop - (win.offsetHeight + win.offsetTop));
			if (!snapVert && distance <= snapDistance) {
				win.style.top = (w.offsetTop - win.offsetHeight) +"px";
				snapVert = true;
			}
			// Horizontal snaps
			// left to xmin
			distance = Math.abs(0 - win.offsetLeft);
			if (!snapHori && distance <= snapDistance) {
				win.style.left = 0 +"px";
				snapHori = true;
			}
			// right to xmax
			distance = Math.abs(window.innerWidth - (win.offsetLeft + win.offsetWidth));
			if (!snapHori && distance <= snapDistance) {
				win.style.left = (window.innerWidth - win.offsetWidth) +"px";
				snapHori = true;
			}
			// left to left
			distance = Math.abs(w.offsetLeft - win.offsetLeft);
			if (!snapHori && distance <= snapDistance) {
				win.style.left = w.offsetLeft +"px";
				snapHori = true;
			}
			// left to right
			distance = Math.abs(w.offsetLeft + w.offsetWidth - win.offsetLeft);
			if (!snapHori && distance <= snapDistance) {
				win.style.left = (w.offsetLeft + w.offsetWidth) +"px";
				snapHori = true;
			}
			// right to left
			distance = Math.abs(w.offsetLeft - (win.offsetWidth + win.offsetLeft));
			if (!snapHori && distance <= snapDistance) {
				win.style.left = (w.offsetLeft - win.offsetWidth) +"px";
				snapHori = true;
			}
		}
	}

	function dragElement(element) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		if (document.getElementById(element.id + "header")) {
		  // if present, the header is where you move the DIV from:
		  document.getElementById(element.id + "header").onmousedown = dragMouseDown;
		} else {
		  // otherwise, move the DIV from anywhere inside the DIV:
		  element.onmousedown = dragMouseDown;
		}
	  
		function dragMouseDown(e) {
		  e = e || window.event;
		  e.preventDefault();
		  // get the mouse cursor position at startup:
		  pos3 = e.clientX;
		  pos4 = e.clientY;
		  document.onmouseup = closeDragElement;
		  // call a function whenever the cursor moves:
		  document.onmousemove = elementDrag;

		//   for (let w of m.windows) {
		// 	  w.style.zIndex = null;
		//   }
		//   element.style.zIndex = 3;
			m.setZIndex(element);
		}
	  
		function elementDrag(e) {
		  e = e || window.event;
		  e.preventDefault();
		  // calculate the new cursor position:
		  pos1 = pos3 - e.clientX;
		  pos2 = pos4 - e.clientY;
		  pos3 = e.clientX;
		  pos4 = e.clientY;

		  
			let newT = element.offsetTop - pos2;
			let newL = element.offsetLeft - pos1;

			if (newT < 0) newT = 0;
			if (newT+element.offsetHeight > window.innerHeight) newT = window.innerHeight - element.offsetHeight;
			if (newL < 0) newL = 0;
			if (newL+element.offsetWidth > window.innerWidth) newL = window.innerWidth - element.offsetWidth;

		  // set the element's new position:
		  element.style.top = newT + "px";
		  element.style.left = newL + "px";
		}
	  
		function closeDragElement() {
		  // stop moving when mouse button is released:
		  document.onmouseup = null;
		  document.onmousemove = null;

		  // snapWindows also handles zIndex for
		  m.snapWindows(element);
		}
	  }

	m.toggle = function() {
		if (m.isLocked) m.showWindows();
		else m.hideWindows();
		m.isLocked = !m.isLocked;
		this.innerHTML = (m.isLocked) ? 'Show Windows' : 'Hide Windows';
	}

	m.hideWindows = function() {
		for (let w of m.windows) {
			w.bg.style.background = null;
			w.drag.style.display = "none";
			w.bg.style.display = "none";
			w.titlebar.style.display = "none";
		}
	}

	m.showWindows = function() {
		for (let w of m.windows) {
			w.bg.style.background = "#036";
			w.drag.style.display = "block";
			w.bg.style.display = "block";
			w.titlebar.style.display = "block";
		}
	}

	m.init = function() {
		for (let i=0; i<defaultAmount; i++) {
			m.add();
		}
	}

	m.init();
	m.thisMenu = ["Player Screens", [
		["Show Windows", o.module.playerscreen.toggle],
	] ];
	m.thisMenu[1] = m.thisMenu[1].concat(windowsMenu);
	m.addMenu(m.thisMenu);

}
