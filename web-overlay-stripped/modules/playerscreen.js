"use strict";
{
	let m = new Module();
	m.createContainer();

	m.selectedLayout = [2,2];
	m.playerAmount = 4;

	m.playerScreens = [];
	m.playerScreensLookupId = [];
	// m.playerScreensLookupPosition = [];
	m.isLocked = true;
	m.dragElements = [];

	m.container.style.position = 'absolute';
	m.container.style.top = '0';
	m.container.style.left = '0';
	m.container.style.display = 'flex';
	m.container.style.flexWrap = 'wrap';
	m.container.style.width = '100%';
	m.container.style.height = '100%';

	// m.thisMenu = ["Player Screens", [
	// 	["Unlock", 'o.module.playerscreen.toggle(this)'],
	// ] ];
	// m.addMenu(m.thisMenu);

	m.toggle = function(_this) {
		m.isLocked = !m.isLocked;
		_this.innerHTML = (m.isLocked) ? 'Unlock' : 'Lock';
		let newState = (m.isLocked) ? 'none' : 'block';
		for (let d of m.dragElements) {
			d.style.display = newState;
		}
	}

	m.getPlayerScreen = function(id) {
		return document.getElementById('p'+m.playerScreensLookupId[id+localPlayers.length]);
	}

	m.switchPlayerScreen = function(sourceId, targetId) {
		let sourcePosition = m.playerScreensLookupId[sourceId];
		let targetPosition = m.playerScreensLookupId[targetId];
		let sourceElement = document.getElementById('p'+sourcePosition);
		let sourceDragElement = document.getElementById('playerdrag'+sourcePosition);
		let targetElement = document.getElementById('p'+targetPosition);
		let targetDragElement = document.getElementById('playerdrag'+targetPosition);
		m.playerScreensLookupId[sourceId] = targetPosition;
		// m.playerScreensLookupPosition[targetPosition] = sourceId;
		sourceElement.playerIndex = targetId;
		sourceDragElement.innerHTML = targetId+1;
		m.playerScreensLookupId[targetId] = sourcePosition;
		// m.playerScreensLookupPosition[sourcePosition] = targetId;
		targetElement.playerIndex = sourceId;
		targetDragElement.innerHTML = sourceId+1;
	}

	m.dragStart = function(e) {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData('playerIndex', e.target.parentNode.playerIndex);
	}

	m.dragOver = function(e) {
		e.dataTransfer.effectAllowed = "move";
		e.preventDefault();
	}

	m.drop = function(e) {
		e.preventDefault();
		let source = parseInt(e.dataTransfer.getData("playerIndex"));
		let target = e.target.parentNode.playerIndex;
		m.switchPlayerScreen(source, target)
	}

	for (let i=0; i<m.playerAmount; i++) {
		m.playerScreens[i]=i;
		m.playerScreensLookupId[i]=i;
		// m.playerScreensLookupPosition[i]=i;
		let perRow = m.selectedLayout[0];
		let perColumn = m.selectedLayout[1];
		let p = document.createElement('div');
		p.id = 'p'+i;
		p.className = 'playerscreen';
		if (m.playerAmount>m.selectedLayout[0] && perColumn>1 && i >= m.playerAmount/2) {
			p.className += " bottom";
			m.bottomSize = true;
		}
		// p.style.outline = '1px dashed #F00';
		p.playerIndex = i;
		p.style.width = 100/perRow +'%';
		p.style.height = 100/perColumn +'%';
		p.style.display = 'flex';
		p.style.alignItems = 'center';
		p.style.justifyContent = 'center';
		p.style.position = 'relative';
		let drag = document.createElement('div');
		m.dragElements.push(drag);
		drag.style.display = 'none';
		drag.id = 'playerdrag'+i;
		drag.style.zIndex = 5;
		drag.className = 'playerdrag';
		drag.innerHTML = (i+1);
		drag.style.textAlign = 'center';
		drag.style.fontSize = '50px';
		drag.style.lineHeight = '100px';
		drag.style.position = 'absolute';
		drag.style.background = '#900';
		drag.style.width = '100px';
		drag.style.height = '100px';
		drag.style.borderRadius = '50%';
		drag.draggable = 'true';
		drag.addEventListener('dragstart', m.dragStart);
		drag.addEventListener('dragover', m.dragOver);
		drag.addEventListener('drop', m.drop);
		p.appendChild(drag);
		m.container.appendChild(p);
	}

}
