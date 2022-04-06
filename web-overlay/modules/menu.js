"use strict";
{
	let m = new Module();
	m.loadCSS();
	m.createContainer();
	// inserts menu button div outside of container

	let menuItems = [
		["Reload","window.location.reload()"],
	];

	m.hideTimeout = null;

	m.clearTimer = function() {
		clearTimeout(m.hideTimeout);
	}

	m.hideTimer = function() {
		clearTimeout(m.hideTimeout);
		m.hideTimeout = setTimeout(m.hideMenu, 1000);
	}

	m.hideMenu = function() {
		m.container.style.display = 'none';
	}

	m.menuClick = function(event) {
		// rootMenu.style.display = 'none';
		if (!this.child) {
			this.className = "click";
			setTimeout(() => {
				this.className = "selected";
			}, 30);
		}

		if (typeof this.command == 'function') {
			this.command(...this.commandArgs);
			return
		}
		let func = eval(this.command);
		if (typeof func == 'function') {
			func(this, ...this.commandArgs);
			return;
		}
	}

	let windows = []; // ul
	let visibleWindows = []; // ul
	let hoveredButton = []; // li

	m.menuMouseenter = function(event) {
		// fix positions
		if (this.child) {
			let pos = this.getBoundingClientRect();
			this.child.style.left = pos.right +"px";
			this.child.style.top = pos.top +"px";
		}
		// figure out what to hide
		for (let i=visibleWindows.length-1; i>=0; i--) {
			if (visibleWindows[i] == this.parentNode) break;
			visibleWindows[i].style.display = "none";
			visibleWindows.pop();
		}
		// show sub menu
		if (this.child) {
			this.child.style.display = "inline-block";
			visibleWindows.push(this.child);
		}
		// color hovered items
		for (let i=hoveredButton.length-1; i>=0; i--) {
			if (hoveredButton[i].child == this.parentNode) {
				hoveredButton[i].className = "selectedsub";
				break;
			}
			hoveredButton[i].className = "";;
			hoveredButton.pop();
		}
		hoveredButton.push(this);
		this.className = "selected";
	}

	function createMenu(parent, data) {

		let ul = document.createElement("ul");
		windows.push(ul);
		m.container.appendChild(ul);
		ul.parent = parent;

		if (parent) {
			let pos = parent.getBoundingClientRect();
			ul.style.left = pos.right +"px";
			ul.style.top = pos.top +"px";
		}

		for (let i=0; i<data.length; i++) {
			let li = document.createElement("li");
			li.innerHTML = data[i][0];
			li.addEventListener("mouseenter", m.menuMouseenter);
			li.addEventListener("click", m.menuClick);
			ul.appendChild(li);
			if (Array.isArray(data[i][1])) {
				li.innerHTML += "<span>❯</span>";
				li.child = createMenu(ul, data[i][1]);
			}
			else {
				li.command = data[i][1];
				li.commandArgs = data[i].slice(2);
			}
		}
		return ul; 
	}

	let nav = createMenu(null, menuItems);

	m.container.addEventListener("mouseleave", m.hideTimer);
	m.container.addEventListener("mouseenter", m.clearTimer);

	window.addEventListener('contextmenu', function(e) {
		// e.preventDefault();
		// return false;
	}, false);

	let trigger = document.createElement('button');
	m.trigger = trigger;
	trigger.id = 'trigger';
	document.body.appendChild(trigger);
	trigger.addEventListener("click", function(event) {
		let newState = (m.container.style.display && m.container.style.display != 'none') ? 'none' : 'inline-block';
		m.container.style.display = newState;
		nav.style.display = newState;
		m.clearTimer();
		event.preventDefault();
		return false;
	});

	m.add = function(data) {
		let li = document.createElement("li");
		li.innerHTML = data[0];
		li.addEventListener("mouseenter", m.menuMouseenter);
		li.addEventListener("click", m.menuClick);
		nav.appendChild(li);
		if (Array.isArray(data[1])) {
			li.innerHTML += "<span>❯</span>";
			li.child = createMenu(nav, data[1]);
		}
		else {
			li.command = data[1];
			li.commandArgs = data.slice(2);
		} 

		m.sortMenu();
	}

	m.sortMenu = function() {
		let test = [].slice.call( nav.children );
		test.sort((a,b) => {
			if(a.textContent < b.textContent) { return -1; }
			if(a.textContent > b.textContent) { return 1; }
			return 0;
		});
		for (let t of test) {
			nav.appendChild(t);
		}
	}

}
