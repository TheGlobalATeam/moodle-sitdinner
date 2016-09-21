'use strict'

//still need to use main script to access local storage...

console.log('Web worker online <3');

var lastPullNewsID = -1;

var firstPull = true;

onmessage = function(e) {

    var jsonData = e.data;

    //console.log('Message received from main script');

    if(jsonData['action'] == 'setLastPullNewsID'){
        setLastPullNewsID(jsonData['newID'], false)
        //console.log("WIndow by object: ",getLastPullNewsID());

        if(firstPull){
            firstPull = false;
            //console.log("starting retrive cycle");
            lookForUpdates();
        }

    }


}


function storageAvailable(type) {
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


function getLastPullNewsID(){

    //postMessage({'action': 'getLastPullNewsID'});
	//remove comment to have it pull on each refresh!
	//return -1;
    return lastPullNewsID;

}

function setLastPullNewsID(newID, postToServer){

    lastPullNewsID = newID;

    if(postToServer){
        //save in local storage
        postMessage({'action': 'setLastPullNewsID', 'newID': newID});
        //pull from local stortage
        postMessage({'action': 'getLastPullNewsID'});
    }

}






function lookForUpdates(){

	//console.log('Web worker looking');

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			//console.log('Web worker found');
			sendNotification(xhttp.responseText);
		}
	};
	xhttp.open("GET", "https://hembstudios.no/birdid/notifications.php?lastNewsID="+getLastPullNewsID(), true);
	xhttp.send();

}

var targetURL;

function sendNotification(data){

	var jsonData = JSON.parse(data);

	//console.log("data: "+data);

	//console.log("WAT: "+jsonData['media_url']);

	if(jsonData['status'] == true){

		var options = {
			body: jsonData['intro'],
			icon: 'https://hembstudios.no/birdid/birdid/'+jsonData['media_url'],
			tag:  "#LiveToLearn"
		}

        targetURL = jsonData['article_url'];

        //console.log(

		var title = jsonData['site_name'] + " News: " + jsonData['headline'];

		var notification = new Notification(title, options);

		notification.onclick = function() {
			notification.close();



            postMessage({'action': 'openURL', 'url': targetURL});

			//postMessage('https://hembstudios.no/birdid/bird/newsArticle.php?newsID='+jsonData['id']);

		}

        //console.log("Before on localsrg: ",getLastPullNewsID());
		setLastPullNewsID(jsonData['id'], true);
        //console.log("Afther on localsrg: ",getLastPullNewsID());

	}





	//wait and execute
	setTimeout(lookForUpdates, 5000);


}

//get the value from local storage as it is not accessable from workers :(
//console.log("sending message to main!");
postMessage({'action': 'getLastPullNewsID'});
//console.log("sendt message to main!");

///setInterval(lookForUpdates(), 5000);
