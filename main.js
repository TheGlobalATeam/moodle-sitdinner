'use strict'

var canUseNotifications = false;

//default value
var lastPullNewsID = -1;

//if local storage is available and not size = 0
function storageAvailable(type) {
	return true;
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
        console.log("wat", e);
		return false;
	}
}

//looking into local storage for it
function getLastPullNewsID(){

    if (storageAvailable('localStorage')) {
        // Yippee! We can use localStorage awesomeness
        //console.log(" Yippee! We can use localStorage awesomeness!");

        //if not set yet
        if(!localStorage.getItem('LastPullNewsID')) {

            localStorage.setItem('LastPullNewsID', -1);

        }

        return localStorage.getItem('LastPullNewsID');


    }
    else {
        // Too bad, no localStorage for us
        return lastPullNewsID;
    }

}

function setLastPullNewsID(newID){

    if (storageAvailable('localStorage')) {
        // Yippee! We can use localStorage awesomeness
        localStorage.setItem('LastPullNewsID', newID);
    }
    else {
    	// Too bad, no localStorage for us
        lastPullNewsID = newID;
    }


}


// Let's check if the browser supports notifications
if (!("Notification" in window)) {
	console.log("This browser does not support desktop notification");
}else if (Notification.permission === "granted") { //already granted

	canUseNotifications = true;

}else if (Notification.permission !== 'denied') {

	console.log("Notification ask");

	// we need to ask the user for permission
	Notification.requestPermission(function (permission) {
		// If the user accepts, let's create a notification
		if (permission === "granted") {
			console.log("Notification allowed");
			canUseNotifications = true;
		}
	});
}

if (window.Worker && canUseNotifications) {

	//starting worker. relative path not working...
	var myWorker = new Worker("/moodle/blocks/sitdinner/notificationWorker.js?"+Math.random());


	myWorker.onmessage = function(e) {
		//console.log('Message received from worker:'+e.data);

		var jsonData = e.data;

		if(jsonData['action'] == 'openURL'){
			window.location.href = "https://hembstudios.no/birdid/"+jsonData['url'];
		}

		if(jsonData['action'] == 'setLastPullNewsID'){
			setLastPullNewsID(jsonData['newID'])
			//console.log("WIndow by object: ",getLastPullNewsID());
		}

		if(jsonData['action'] == 'getLastPullNewsID'){

			//send the stored ID
			myWorker.postMessage({'action': 'setLastPullNewsID', 'newID': getLastPullNewsID()});
			//console.log("WIndow by object SENDT!: ",getLastPullNewsID());

		}


	};

	myWorker.onerror = function(e) {
		console.error('Web Worker Error on line ('+e.lineno+'): '+e.message + " | In file: "+e.filename);
	};


}
