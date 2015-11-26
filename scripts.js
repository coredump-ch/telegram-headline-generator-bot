/* MIT licence, (c) 2014-2015 coredump Rapperswil, Jannis Grimm */

var followers = {};
var headlines = [];

function printHeadline() {
	var headlineParts = headlineGenerator.getHeadline(followers, headlines);
	
	document.getElementById('headlines').innerHTML += '<hgroup><h3>' + headlineParts[0] + '<span class="hidden">:</span></h3><h2>' + headlineParts[1] + '</h2></hgroup>';
}

var followersXHR = new XMLHttpRequest();
followersXHR.onreadystatechange = function () {
	var DONE = this.DONE || 4;
	if (this.readyState === DONE) {
		followers = JSON.parse(followersXHR.responseText);
		var headlinesXHR = new XMLHttpRequest();
		headlinesXHR.onreadystatechange = function () {
			var DONE = this.DONE || 4;
			if (this.readyState === DONE) {
				headlines = JSON.parse(headlinesXHR.responseText);
				document.getElementById('headlines').className = '';
				printHeadline();
				printHeadline();
				printHeadline();
				printHeadline();
				printHeadline();
				printHeadline();
			}
		};
		headlinesXHR.open('GET', 'headlines.json', true);
		headlinesXHR.send();
	}
};
followersXHR.open('GET', 'followers.json', true);
followersXHR.send();
