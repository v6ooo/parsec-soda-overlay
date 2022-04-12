"use strict";
{
	let m = new Module();
	m.loadCSS();
	m.createContainer();
	m.container.style.display = "none";

	let onlyHost = false;

	let pollQuestion = null;
	let pollOptions = [];
	let stopVote = false;
	let votingStarted = false;
	let castVote = false;
	let votes = {};
	let optionVotes = [];
	let totalVotes = 0;
	let votingTime = 20000;
	let countdownTime = 0;
	let lastTimestamp = null;

	m.votebox = document.createElement("div");
	m.votebox.className = "votebox";
	m.container.appendChild(m.votebox);

	o.makeDraggable(m.votebox);

	m.timeleft = document.createElement("div");
	m.timeleft.className = "timeleft";
	m.votebox.appendChild(m.timeleft);
	m.timeleftbar = document.createElement("div");
	m.timeleftbar.className = "timeleftbar";
	m.timeleft.appendChild(m.timeleftbar);

	m.question = document.createElement("div");
	m.question.className = "question";
	m.votebox.appendChild(m.question);

	m.options = document.createElement("div");
	m.options.className = "options";
	m.options.style.listStyleType = "decimal";
	m.votebox.appendChild(m.options);


	function capitalize(text) {
		if (!text || text.length == 0) return "";
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	function animate(timestamp) {
		let tick = lastTimestamp ? timestamp - lastTimestamp : 0;
		countdownTime -= tick;
		if (countdownTime < 0 || stopVote) countdownTime = 0;
		m.timeleftbar.style.width = ( (countdownTime) / votingTime * 100 ) +"%";
		lastTimestamp = timestamp;

		if (countdownTime > 0) requestAnimationFrame(animate);
		else {
			let stopTime = stopVote ? 3000 : 7000;
			lastTimestamp = null;
			castVote = false;
			setTimeout(endVoting, stopTime);
		}
	}

	function clearVotes() {
		votes = {};
		optionVotes = [];
		totalVotes = 0;
	}

	function clearPoll() {
		pollQuestion = null;
		pollOptions = [];
		m.question.innerText = "";
		m.options.innerText = "";
		stopVote = false;
		clearVotes();
	}

	function startVoting() {
		m.container.style.display = "flex";
		votingStarted = true;
		castVote = true;
		countdownTime = votingTime;
		requestAnimationFrame(animate);
	}

	function endVoting() {
		m.container.style.display = "none";
		m.timeleftbar.style.width = "100%";
		clearPoll();
		votingStarted = false;
	}

	function updateVotes() {
		for (let i=0; i<pollOptions.length; i++) {
			pollOptions[i].votes.innerText = optionVotes[i];
			let percent = Math.round(optionVotes[i] / totalVotes * 100)+"%";
			pollOptions[i].progressbar.style.width = percent;
		}
	}

	function createPoll(voteData) {
		m.question.innerText = capitalize(pollQuestion);
		for (let i=0; i<voteData.length; i++) {
			optionVotes[i] = 0;

			let a = document.createElement("div");
			a.className = "optioncontainer";
			m.options.appendChild(a);
			a.answer = voteData[i];
			pollOptions.push(a);

			a.progressbar = document.createElement("div");
			a.progressbar.className = "optionprogressbar";
			a.appendChild(a.progressbar);

			a.pollanswer = document.createElement("div");
			a.pollanswer.className = "optionline";
			a.appendChild(a.pollanswer)

			a.number = document.createElement("div");
			a.number.className = "optionnumber";
			a.pollanswer.appendChild(a.number);
			a.number.innerText = i+1;

			a.text = document.createElement("div");
			a.text.className = "optionname";
			a.pollanswer.appendChild(a.text);
			a.text.innerText = capitalize(voteData[i]);

			a.votes = document.createElement("div");
			a.votes.className = "optionvotes";
			a.pollanswer.appendChild(a.votes);
			a.votes.innerText = 0;
		}
	}


	o.ws.addHook("chat", function(event, data) {

		if (data.content == "#stoppoll" || data.content == "#endpoll") {
			if (o.ws.host.userid != data.userid) return;
			stopVote = true;
			return;
		}

		if (data.content.startsWith("#poll ")) {
			if (votingStarted) return;
			if (onlyHost && o.ws.host.userid != data.userid) return;
			let voteData = data.content.split('|').map(element => element.trim());
			pollQuestion = voteData[0].replace("#poll","").trim();
			if (pollQuestion.length == 0) return;
			voteData.shift();
			if (voteData.length == 0) {
				voteData.push("Yes");
				voteData.push("No");
			}
			createPoll(voteData);
			startVoting();
			return;
		}

		if (!votingStarted || !castVote) return;

		let regex = /^#?([0-9]{1,2})\.?$/; // match #1 1 1.
		let match = data.content.match( regex );
		if (match && match.length > 1) {
			let checkId = data.id;
			let select = match[1];
			if (select > pollOptions.length) return;
			if (votes[checkId] != null) return;
			select -= 1;
			votes[checkId] = select;
			if (!optionVotes[select]) optionVotes[select] = 1;
			else optionVotes[select] += 1;
			totalVotes++;
			updateVotes();
		}

	});

}
