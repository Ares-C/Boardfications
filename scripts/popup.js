/*
	Author: AresC
	Project: Boardfications
	Repository: https://github.com/Ares-C/Boardfications
*/

var linkTag = document.createElement ("link"); linkTag.href = "/stylesheets/boards.css"; linkTag.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(linkTag);

setTimeout(function(){apply_i18n_to_popup(); document.body.style = "visibility:visible"}, 50)

var notifications = chrome.extension.getBackgroundPage().notifications;
var champions = chrome.extension.getBackgroundPage().champions;
var getRegion = function () { return chrome.extension.getBackgroundPage().getRegion(); };

if ( Object.keys(notifications).length > 0) {
	
	var source = "";
	for(key in notifications) {
		var item = notifications[key];
		
		if (item) {
			var board = item[0];
			var discussion = item[1];
			var comment = item[2];
			var parentDiscussion = item[3];
			var parentDiscussion_url = item[4];
			var profile_url = item[5];
			var profile_sn = item[6];
			var server = item[7];
			var timeago = item[8];
			var url = item[9];
			var message = item[10];
			var isRioter = item[11];
			
			var avatar = isRioter && `/images/riot_fist.png` || `https://avatar.leagueoflegends.com/${getRegion()}/${encodeURIComponent(profile_sn)}.png`;
			var fontcolor = isRioter && `<font color=#ae250f> ${profile_sn} </font>` || profile_sn;
			var gotocomment = chrome.i18n.getMessage("main_gtc");
			var _in = chrome.i18n.getMessage("main_in");
			
			source = source + 
			`<div class='update-item' data-application-id=${board} data-discussion-id=${discussion} data-comment-id=${comment}>
				<div class='parent-comment'> 
					<span>${_in}</span> 
					<a href=${parentDiscussion_url} target='_blank'>${parentDiscussion}</a> 
				</div>
				<div class='comment clearfix'> 
					<div class='header byline clearfix'> 
						<div class='inline-profile'>
							<a href=${profile_url} target='_blank'>
								<span class='icon'>
									<img src=${avatar}>
								</span>
								<span class='username'>
									${fontcolor}
								</span>
							</a>
							<span class='realm'>
								${server}
							</span>
						</div>
						<span class='timeago' title=${timeago}> </span> 
					</div>
					<div class='body markdown-content'>
						${message}
					</div> 
					<div class='footer'>
						<div class='right'>
							<a href=${url} target='_blank'>${gotocomment}</a>
						</div> 
					</div> 
				</div> 
			</div>`
			document.getElementById("my-updates").innerHTML = source;
		}
	}
}


document.getElementById("settings").onclick = function() {
  	if (chrome.runtime.openOptionsPage) {
    		chrome.runtime.openOptionsPage();
  	} else {
    		window.open(chrome.runtime.getURL('options.html'));
  	}
};

document.getElementById("clear").onclick = function() {
	var a = document.getElementsByClassName("update-item")
	var comments = {};

	comments["readState"] = "true"
	
	for(var i = 0; i<a.length; i++) {
		var item = a[i];
		var board = item.getAttribute("data-application-id");
		var discussion = item.getAttribute("data-discussion-id");
		var comment = item.getAttribute("data-comment-id");
		
		comments[`comments[${board}][${discussion}][]`+" ".repeat(i+1)] = comment;
	}	
	chrome.extension.getBackgroundPage().setAsRead(comments);
	window.close();
};

document.getElementById("about").onclick = function() {
	var disclaimer = document.getElementById("disclaimer");
	if ( disclaimer.style["display"] == "none" || !disclaimer.style["display"] ) {
		disclaimer.style = "display: inline-block";
		window.scrollTo(0, window.innerHeight);
	} else {
		disclaimer.style = "display: none";
	}
};

function apply_i18n_to_popup (){
	var objects = document.getElementsByTagName("*");
	
	for (var i=0, max=objects.length; i < max; i++) {
		var object = objects[i];
		if (object && object.getAttribute("data-i18n") == "true") {
			var message = chrome.i18n.getMessage(object.innerHTML.trim());
			object.innerText = message;
		}
	}
}

