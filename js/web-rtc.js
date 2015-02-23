<!--
function log(text){
	document.getElementById('progress').innerHTML = document.getElementById('progress').innerHTML + '<br>' +text;
}
function logEvent(text){
	document.getElementById('event').innerHTML = document.getElementById('event').innerHTML + '<br>' +text;
}
var GW_URL = "https://api.att.com",SERVICE_NAME="RTC",version="v1", REGISTER_RESOURCE = "sessions";
var registerURL = GW_URL + "/" + SERVICE_NAME + "/" + version + "/" + REGISTER_RESOURCE;
//var window.sessionId="";
function createSession (){
var accessToken = "e9kuitpmoytukor9kqmjkdywjxovpg0d";
var xE911Id = "905d:4e47:1f70:6fa9";
    
			var obj={
			mediaType: "dtls-srtp",
			ice:  "true",
			services: [
				"ip_voice_call",
				"ip_video_call"
			]
		};
		var body = {};
		body.session = obj;
		// Create and send a Session request
		var req = new XMLHttpRequest();
		// Set headers and send Request
		req.open("POST", registerURL, true);
		req.setRequestHeader("content-type", "application/json");
		req.setRequestHeader("accept", "application/json");
		req.setRequestHeader("x-e911id", xE911Id);
		req.setRequestHeader("authorization", "Bearer " + accessToken);
				// clean up contents of the div
		log("Registering address : "+JSON.stringify(obj));
		req.send(JSON.stringify(body, null, " "));
		// On response
		req.onreadystatechange = function() {
			if (this.readyState == 4) {
				console.log("Registering...");
				// Success response 201 Created
				if (this.status == 201) {
					document.getElementById('createSession').disabled = true;
					document.getElementById('deleteSession').disabled = false;
					document.getElementById('call').disabled = false;
					console.log("Registration successful");
					log("Registration successful");
					var location  = this.getResponseHeader('location');
					var tokens = location.split("/");
					var index = tokens.indexOf("sessions");
					window.sessionId = tokens[index + 1];
					console.log("Session Id : " + window.sessionId);
					log("Session Id : " + window.sessionId);
					log("Starting event long polling");
					startLongpollingChannel();
				} else {
					console.log("Registration unsuccessful: " + this.status + " " + this.statusText);
					switch (this.status) {
						case 401: // 401 Unauthorized
						case 403: // 403 Forbidden
						case 400: // 403 Forbidden
							log("HTTP Error:"+this.status + this.responseText);
							break;
						default:
							log("HTTP Error:"+"NETWORK_FAILURE");
							break;
					}
				}
			};
		};
};
//Long Polling Function - GET EVENTS
function startLongpollingChannel() {
			var CHANNEL_RESOURCE="events" ;
			var channelURL = GW_URL + "/" + SERVICE_NAME + "/" + version + "/" + REGISTER_RESOURCE +  "/" + window.sessionId +  "/" + CHANNEL_RESOURCE;
			console.log("Querying channel...");
			logEvent("Querying channel...");
			var req = new XMLHttpRequest();
			req.open("GET", channelURL, true);
			req.setRequestHeader('Cache-Control', 'no-cache');
			req.setRequestHeader('Pragma', 'no-cache');
		    req.setRequestHeader("accept", "application/json");
			var tokenwa = document.getElementById("token").value;
			req.setRequestHeader("authorization", "Bearer " + tokenwa);
			req.send(null);
			// On response
			req.onreadystatechange = function() {
				if (this.readyState == 4) {
					// Success response 200 OK
					if (this.status == 200) {
						console.log("Received long polling response: " + this.status + " " + this.statusText + " " + this.responseText);
						logEvent("Received long polling response: " + this.status + " " + this.statusText + " " + this.responseText);
						var json = JSON.parse(this.responseText);
						// Parse channel events
						var state = json.events.eventList[0].eventObject.state;
						if(state == 'session-terminated'){
							document.getElementById('end').disabled = true;
							document.getElementById('call').disabled = false;
						}
						else if ( state == 'session-open'){
							document.getElementById('end').disabled = false;
							document.getElementById('call').disabled = true;
						}
						// Poll again
							timer = 2000;
							setTimeout(function(){startLongpollingChannel(window.sessionId);},5);
					}
						// Success response 204 No Content
						else if (this.status == 204) {
						console.log("Get channel successful: " + this.status + " " + this.statusText + " " + this.responseText);
						logEvent("Get channel successful:  " + this.status + " " + this.statusText + " " + this.responseText);
						// Poll again
							timer = 2000;
							setTimeout(function(){startLongpollingChannel(window.sessionId);},5);
					}
				}
			};
		};
// Stop Session
function deleteSession (){
		var accessToken = "e9kuitpmoytukor9kqmjkdywjxovpg0d";
		unregisterURL = GW_URL + "/" + SERVICE_NAME + "/" + version + "/" + REGISTER_RESOURCE +  "/" + window.sessionId;
		var req = new XMLHttpRequest();
		req.open("DELETE", unregisterURL, false);
		req.setRequestHeader("authorization", "Bearer " + accessToken);
		req.setRequestHeader("X-http-method-override", "DELETE");
		req.setRequestHeader("Accept", "application/json");
		req.send(null);
		log("Session closed");
		document.getElementById('event').innerHTML = "";
		document.getElementById('createSession').disabled = false;
		document.getElementById('end').disabled = false;
		document.getElementById('call').disabled = false;
		document.getElementById('deleteSession').disabled = true;
};
//Browser API to generate SDP
	 var mediaConstraints = {
		 optional: [],
		 mandatory: {
			 OfferToReceiveAudio: true,
			 OfferToReceiveVideo: true
		 }
	 };
		 var offerer, answerer;
		 var offererToAnswerer = document.getElementById('peer1-to-peer2');
		//Steps to support Chrome and Firefox WebRTC Implementation
		 window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
		 window.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
		 window.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
		 navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
		 window.URL = window.webkitURL || window.URL;
		 window.OfferSdp;
		 window.iceServers = {
			 iceServers: [{
				 url: 'stun:23.21.150.121'
			 }]
		 };
 function offererPeer(stream) {
     offerer = new RTCPeerConnection(window.iceServers);
     offerer.addStream(stream);
     offerer.onaddstream = function (event) {
         offererToAnswerer.src = URL.createObjectURL(event.stream);
         offererToAnswerer.play();
     };
     offerer.onicecandidate = function (event) {
         if (!event || !event.candidate) return;
         };
     offerer.createOffer(function (offer) {
         offerer.setLocalDescription(offer);
		 console.log("SDP Generated",offer.sdp);
		 window.OfferSdp = offer.sdp;
		 makeCall();
		 }, onSdpError);
}
 function getUserMedia(callback) {
     navigator.getUserMedia({
         audio: true,
         video: true
     }, callback, onerror);
     function onerror(e) {
         console.error(e);
     }
 }
 function GetSdp(){getUserMedia(function (stream) {
     offererPeer(stream);
 	  });
	       function onerror(e) {
         console.error(e);
     }
 }
 function onSdpError(e) {
     console.error('onSdpError', e);
 }
 function onSdpSucces() {
     console.log('onSdpSucces');
 }
function call(){
	GetSdp();
}
function makeCall(){
var SessionId = window.sessionId;
var GW_URL = "https://api.att.com",SERVICE_NAME="RTC",version="v1", REGISTER_RESOURCE = "sessions",CALL_RESOURCE="calls" ;
var callUrl = GW_URL + "/" + SERVICE_NAME + "/" + version + "/" + REGISTER_RESOURCE +  "/" + SessionId +  "/" + CALL_RESOURCE;
var accessToken = document.getElementById('token').value;
var recipient = "3608701373";
		body = {
						call: {
						calledParty : recipient,
						sdp : window.OfferSdp
						}
					};
		// Create and send a Call request
		var req = new XMLHttpRequest();
		// Set headers and send Request
		req.open("POST", callUrl, true);
		req.setRequestHeader("content-type", "application/json");
		req.setRequestHeader("accept", "application/json");
		req.setRequestHeader("authorization", "Bearer " + accessToken);
		log("Creating call with info :" +JSON.stringify(body, null, " "));
		req.send(JSON.stringify(body, null, " "));
		// On response
		req.onreadystatechange = function() {
			if (this.readyState == 4) {
				console.log("Request Sent...");
				// Success response 201 Created
				if (this.status == 201) {
					console.log("Call Id Created successful");
					log("Call Id Created successful");
					console.log(" CallId Info: " + this.responseText);
					log(" CallId Info: " + this.responseText);
					var location  = this.getResponseHeader('location');
					var tokens = location.split("/");
					var index = tokens.indexOf("calls");
					window.callId = tokens[index + 1];
					console.log("Call Id : " + window.callId);
					log("Call Id : " + window.callId);
					} else {
					console.log(" HTTP Error " + this.status);
					log(" HTTP Error " + this.status);
					log(" HTTP Error " + this.responseText);
					}
			};
		};
};
function end(){
		var SessionId = window.sessionId;
		var GW_URL = "https://api.att.com",SERVICE_NAME="RTC",version="v1", REGISTER_RESOURCE = "sessions",CALL_RESOURCE="calls" ;
		var accessToken = "e9kuitpmoytukor9kqmjkdywjxovpg0d";
		var endCallURL = GW_URL + "/" + SERVICE_NAME + "/" + version + "/" + REGISTER_RESOURCE +  "/" + window.sessionId + "/" + CALL_RESOURCE + "/" + window.callId;
		var req = new XMLHttpRequest();
		req.open("DELETE", endCallURL, false);
		req.setRequestHeader("authorization", "Bearer " + accessToken);
		req.setRequestHeader("x-delete-reason","terminate");
		req.setRequestHeader("Accept", "application/json");
		req.send(null);
}; 
-->