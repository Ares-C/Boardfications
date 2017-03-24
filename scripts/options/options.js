
function onDocumentLoad() {
	var linkTag = document.createElement ("link"); linkTag.href = "/stylesheets/options/options.css"; linkTag.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(linkTag);

	apply_i18n_to_popup();
	
	chrome.storage.sync.get({
		updateDelay: 15,
		enableNotifications: true,
		region: "las"
	}, function(items) {
		document.getElementById('updateDelay').value = items.updateDelay;
		document.getElementById('enableNotifications').checked = items.enableNotifications;
		document.getElementById('region').value = items.region
	});	
}
document.addEventListener('DOMContentLoaded', onDocumentLoad);

function save_options() {
  var updateDelay = document.getElementById('updateDelay').value;
  var enableNotifications = document.getElementById('enableNotifications').checked;
  var region = document.getElementById("region").value;
  
    if ( typeof updateDelay != "number" ) {
		if ( typeof Number(updateDelay) != "number" ) {
	   		updateDelay = 15; document.getElementById('updateDelay').value = 15;
		} else {
	  		if ( Number(updateDelay) > 60 ) {
	  			updateDelay = 60; document.getElementById('updateDelay').value = 60;
	  		} else {	
	  			if ( Number(updateDelay) < 10 ) {
	  				updateDelay = 10; document.getElementById('updateDelay').value = 10;
	  			}
	  		}
	  	}
	}
	
	checkPermissions(region);
	
	chrome.storage.sync.set({
		updateDelay: updateDelay,
		enableNotifications: enableNotifications,
		region: region
	}, function(region) {
		var status = document.getElementById('status');
		status.textContent = chrome.i18n.getMessage("options_saved");
		setTimeout(function() {
			chrome.tabs.getCurrent(function (tab) {chrome.tabs.remove(tab.id)});
			chrome.extension.getBackgroundPage().reloadExtension();
			status.textContent = '';
		}, 750);
	});
}

document.getElementById('save').addEventListener('click', save_options);

function checkPermissions(region) {
	chrome.permissions.contains({
	  origins: [`https://boards.${region}.leagueoflegends.com/`]
	}, function (permission) {
		if (!permission) {
			askForPermissions(region);
		}
	});
}

function askForPermissions(region) {
	chrome.permissions.request({
		origins: [`https://boards.${region}.leagueoflegends.com/`]
		}, function(granted) {
			if (!granted) {
				var message = chrome.i18n.getMessage("options_permissions")
				if (confirm(message)) {
					checkPermissions(region);
				}
			}
		}
	);
}

function apply_i18n_to_popup (){
	var objects = document.getElementsByTagName("*");
	
	for (var i=0, max=objects.length; i < max; i++) {
		var object = objects[i];
		if (object && object.getAttribute("data-i18n") == "true") {
			var message = chrome.i18n.getMessage(object.innerHTML.trim()); message = (message == "" && object.innerText || message)
			object.innerText = message;
		}
	}
}

