"use strict";
{
	let m = new Module();
	m.loadCSS();
	m.createContainer();

	let menuItems = [
		// ["Show BG","o.module.newmenu.bg(this)"],
		["Reload","window.location.reload()"]
	];
	m.hideTimeout = null;

	m.bg = function(_this) {
		_this.status = !document.body.classList.contains('movingbg');
		_this.innerHTML = (_this.status) ? 'Hide BG' : 'Show BG';
		document.body.classList.toggle('movingbg');
	}

	m.hideTimer = function() {
		clearTimeout(m.hideTimeout);
		m.hideTimeout = setTimeout(m.hideMenu, 5000);
	}

	m.hideMenu = function() {
		rootMenu.style.display = 'none';
	}

	function showSub() {
		console.log("show sub");
	}

	function null1(_this) {
		_this.status = !_this.status;
		let status = (_this.status) ? 'ON' : 'OFF';
		_this.innerHTML = status;
	}

	function null2(_this) {
		_this.status = !_this.status;
		let status = (_this.status) ? 'ON' : 'OFF';
		_this.innerHTML = status;

	}

	o.click = function() {
		this.blur();
		rootMenu.style.display = 'none';
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

	function createSub(parent, data, index=0, depth=0) {
		let ul = document.createElement('ul');
		parent.ul = ul;
		// if (!Array.isArray(parent.sub)) parent.sub = [];
		for (let i=0; i<data.length; i++) {
			let li = document.createElement('li');
			let a = document.createElement('a');
			// a.href = data[i][1];
			// a.innerHTML = data[i][0] +" (depth: "+depth+")";
			a.innerHTML = data[i][0];
			li.appendChild(a);
			a.href = 'javascript:void(0)';
			if (Array.isArray(data[i][1])) {
				a.innerHTML += '<span>❯</span';
				// m = document.createElement('div');
				// m.addEventListener('click', showSub);
				createSub(li, data[i][1], i, depth+1);
			}
			else {
				// a.href = 'javascript:'+data[i][1];
				a.onclick = o.click;
				a.command = data[i][1];
				a.commandArgs = data[i].slice(2);
			}
			ul.appendChild(li);
			// if (m) parent.sub.push(m);
			// if (m) parent.appendChild(m);
		}
		parent.appendChild(ul);
		return ul;
	}

	m.add = function(data) {
		// for (let i=0; i<data.length; i++) {
			let li = document.createElement('li');
			let a = document.createElement('a');
			a.href = 'javascript:void(0)';
			
			// a.onclick = o.click;
			 // a.innerHTML = data[i][0] +" (depth: "+depth+")";
			// a.innerHTML = data[i][0];
			a.innerHTML = data[0];
			li.appendChild(a);
			if (Array.isArray(data[1])) {
				a.innerHTML += '<span>❯</span';
				createSub(li, data[1]);
			}
			rootMenu.ul.appendChild(li);
			// rootMenu.sub.appendChild(li);
		// }
		// return ul;
	}

	let rootMenu = document.createElement('div');
	rootMenu.className = 'nav';
	rootMenu.style.display = 'none';

	rootMenu.onmouseover = m.hideTimer;
	createSub(rootMenu, menuItems);
	m.container.appendChild(rootMenu);

	window.addEventListener('contextmenu', function(e) {
		// e.preventDefault();
		// return false;
	}, false);

	let trigger = document.createElement('button');
	m.trigger = trigger;
	trigger.id = 'trigger';
	document.body.appendChild(trigger);
	trigger.addEventListener("click", function(event) {
		// console.log(event);
		m.hideTimer();
		rootMenu.style.display = (rootMenu.style.display != 'none') ? 'none' : 'inline-block';
		event.preventDefault();
		return false;
	});

}
