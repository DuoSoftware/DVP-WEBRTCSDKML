# # DVP-WEBRTCSDKML

### Programing with the API.

 - Initialize the Phone. 
  -     This is the first function to call in order to initialize the media and signaling engines.

   - Making/receiving audio/video calls
        -    Make call: 
                ```javascript
                duoWebPhone.makeCall(number,CallType.video);
                                
                // call back function
                var onSipEventSession= function (e) {
                    if(e.type == 'connected'){ 
                        alert("Call Connected.");
                    }
                };
                ```
          - Accept call:
            ```javascript
            duoWebPhone.acceptCall();
            ```
          
          - Reject call:
            ```javascript
            duoWebPhone.rejectCall();
            ```

### Sample Data Structures

```javascript
    var callBackEvents = {
            onErrorCallback: onErrorCallback,
            onIncomingCall: onIncomingCall,
            onReceiveMessage: onReceiveMessage,
            onEventsListener: onEventsListener,
            onPresenceUpdate: onPresenceUpdate,
            onSipEventSession: onSipEventSession
        };
```

```javascript
var config = {
        mediaCache: false,
        videoLocalElementId: "videoLocal",
        videoRemoteElementId: "videoRemote",
        viewLocalScreencast: "localScreencast",
        audioRemoteId: "audioRemote"
    };
```
```javascript
var profile = {
            authorizationName:"1005",
            publicIdentity:"sip:1005@162.243.124.66",
            password:"1234",
            displayName:"1005" ,
            server : {
                    domain:"162.243.124.66",
                    websocketUrl:"wss://162.243.124.66:7443",
                    outboundProxy:"",
                    enableRtcwebBreaker:false
                    }
        };
```

### Call-back functions
```javascript
    // Notified every errors to user
    var onErrorCallback= function (e) {
        alert("onErrorCallback");
    };
```
```javascript
    // Duo Phone SDK will call this function and notified for the every incoming call
    var onIncomingCall=function (e) { 
        };
```
```javascript
    // Duo Phone SDK will call this function when user receive new Message
    var onReceiveMessage= function (e) {
        };
```
```javascript
    // Duo Phone SDK will call this function to notify for the state change.
    var onEventsListener= function (e) {
        };
```
```javascript
    // Duo Phone SDK will call this function to notify for the Presence Update.
    var onPresenceUpdate= function (e) {
        };
```
```javascript
    // Duo Phone SDK will call this function to notify for the Sip event Update.
    var onSipEventSession= function (e) {
        };
```
