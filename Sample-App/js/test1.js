var UserEvent = {};
var sipStack;
var registerSession;
var callSession;
var DomainName, UserName, SipUri, Password, WebsocketUrl, OutboundUrl, MediaCache = "";

function SipRegister(domainName, userName, sipUri, password, websocketUrl, outboundUrl, onIncomingCall, onReceiveMessage, onEventsListener, onSipEventSession, onPresenceUpdate, onErrorCallback, videoLocalElementId, videoRemoteElementId, viewLocalScreencast, audioRemoteId, mediaCache) {
    DomainName = domainName;
    UserName = userName;
    SipUri = sipUri;
    Password = password;
    WebsocketUrl = websocketUrl;
    OutboundUrl = outboundUrl;

    UserEvent.onErrorCallback = onErrorCallback;
    UserEvent.onIncomingCall = onIncomingCall;
    UserEvent.onReceiveMessage = onReceiveMessage;
    UserEvent.onEventsListener = onEventsListener;
    UserEvent.onPresenceUpdate = onPresenceUpdate;
    UserEvent.onSipEventSession = onSipEventSession;


    /* CallConfig = {
     audio_remote: document.getElementById(audioRemoteId),
     video_local: document.getElementById(videoLocalElementId),
     video_remote: document.getElementById(videoRemoteElementId),
     screencast_window_id: 0x00000000, // entire desktop
     bandwidth: {audio: undefined, video: undefined},
     video_size: {minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined},
     events_listener: {events: '*', listener: SipEventSession},
     sip_caps: [
     {name: '+g.oma.sip-im'},
     {name: 'language', value: '\"en,fr\"'}
     ]
     };*/


    DuoWebRtcSip.init(this.readyCallback, this.errorCallback);
    alert("SipRegisterUA.....");

}

function SipUnregister(e) {
    sipStack.stop();
}
function readyCallback(e) {
// attachs video displays
    if (DuoWebRtcSip.isWebRtc4AllSupported()) {

        DuoWebRtcSip.WebRtc4all_SetDisplays(document.getElementById(videoLocalElementId), getElementById(videoRemoteElementId), getElementById(viewLocalScreencast)); // FIXME: move to SIPml.* API
    }
    this.createSipStack();
}
function errorCallback(e) {
    UserEvent.onErrorCallback(e);
}
// events Liste ner
function eventsListener(e) {

    switch (e.type) {
        case 'started':
        {
            login();
            break;
        }
        case 'i_new_call':
        {
            callSession = e.newSession;
            // start listening for events
            //callSession.setConfiguration(CallConfig);
            // incoming audio/video call
            UserEvent.onIncomingCall(callSession);
            callSession.accept();
            //callSession.accept(CallConfig);
            break;
        }
        case 'i_new_message':
        {// incoming new SIP MESSAGE (SMS-like)
            e.newSession.accept(); // e.newSession.reject(); to reject the message
            UserEvent.onReceiveMessage(e);
            break;
        }
        case 'stopping':
        case 'stopped':
        case 'failed_to_start':
        case 'failed_to_stop':
        case 'terminated':
        {
            UserEvent = null;
            sipStack = null;
            registerSession = null;
            callSession = null;
            UserEvent.onEventsListener(e);
        }
        case 'failed_to_start':
        case 'failed_to_stop':
        case 'm_permission_requested':
        case 'm_permission_accepted':
        case 'm_permission_refused':
        case 'starting':
        {
            UserEvent.onEventsListener(e);
            break;
        }
        default:
        {
            UserEvent.onEventsListener(e);
            break;
        }
    }
}
//onSipEventSession
function SipEventSession(e) {
    switch (e.type) {
        case 'i_notify':
        {
            UserEvent.onPresenceUpdate(e);
            break;
        }
        case 'connected':
        {
            publishPresence('Online', 'Loged to System');
            UserEvent.onSipEventSession(e);

            break;
        }
        case 'i_ect_new_call':
        {
            UserEvent.onSipEventSession(e);
            break;
        }
        case 'connecting':
        case 'terminating':
        case 'terminated':
        case 'm_stream_video_local_added':
        case 'm_stream_video_local_removed':
        case 'm_stream_video_remote_added':
        case 'm_stream_video_remote_removed':
        case 'm_stream_audio_local_added':
        case 'm_stream_audio_local_removed':
        case 'm_stream_audio_remote_added':
        case 'm_stream_audio_remote_removed':
        case 'i_ao_request':
        case 'm_early_media':
        case 'm_local_hold_ok':
        case 'm_local_hold_nok':
        case 'm_local_resume_ok':
        case 'm_local_resume_nok':
        case 'm_remote_hold':
        case 'm_remote_resume':
        case 'm_bfcp_info':
        case 'o_ect_trying':
        case 'o_ect_accepted':
        case 'o_ect_completed':
        case 'i_ect_completed':
        case 'o_ect_failed':
        case 'i_ect_failed':
        case 'o_ect_notify':
        case 'i_ect_notify':
        case 'i_ect_requested':
        {
            UserEvent.onSipEventSession(e);
            break;
        }
        default:
        {
            UserEvent.onSipEventSession(e);
        }
    }
}
/* onPresenceUpdate....
 var eventsListener = function (e) {
 console.info('session event = ' + e.type);
 if (e.type == 'i_notify') {
 console.info('NOTIFY content = ' + e.getContentString());
 console.info('NOTIFY content-type = ' + e.getContentType());

 if (e.getContentType() == 'application/pidf+xml') {
 if (window.DOMParser) {
 var parser = new DOMParser();
 var xmlDoc = parser ? parser.parseFromString(e.getContentString(), "text/xml") : null;
 var presenceNode = xmlDoc ? xmlDoc.getElementsByTagName("presence")[0] : null;
 if (presenceNode) {
 var entityUri = presenceNode.getAttribute("entity");
 var tupleNode = presenceNode.getElementsByTagName("tuple")[0];
 if (entityUri && tupleNode) {
 var statusNode = tupleNode.getElementsByTagName("status")[0];
 if (statusNode) {
 var basicNode = statusNode.getElementsByTagName("basic")[0];
 if (basicNode) {
 console.info('Presence notification: Uri = ' + entityUri + ' status = ' + basicNode.textContent);
 }
 }
 }
 }
 }
 }
 }
 }
 */

// Create a SIP stack
function createSipStack() {

    // create SIP stack
    sipStack = new SIPml.Stack({
            realm: DomainName, // mandatory: domain name
            impi: UserName, // mandatory: authorization name (IMS Private Identity)
            impu: SipUri, // mandatory: valid SIP Uri (IMS Public Identity)
            password: Password, // optional
            display_name: UserName, // optional
            websocket_proxy_url: WebsocketUrl, // optional
            outbound_proxy_url: OutboundUrl, // optional
            ice_servers: null,
            enable_rtcweb_breaker: true,
            events_listener: {events: '*', listener: eventsListener},
            enable_early_ims: true, // Must be true unless you're using a real IMS network
            enable_media_stream_cache: MediaCache,
            bandwidth: {audio: undefined, video: undefined},
            video_size: {minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined},
            sip_headers: [
                {name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2015.03.18'},
                {name: 'Organization', value: 'DuoSoftware'}
            ]
        }
    );


    sipStack.start();
}// End Create a SIP stack

// Logging
function login() {
    registerSession = sipStack.newSession('register', {
        events_listener: {events: '*', listener: SipEventSession} // optional: '*' means all events
    });
    registerSession.register();

}// End Logging
// Making audio/video call
function makeCall(user) {
    //callSession = sipStack.newSession('call-audiovideo', CallConfig);
    callSession = sipStack.newSession('call-audiovideo');
    callSession.call(user);
}// End Making audio/video call
// Accept audio/video call
function acceptCall() {
    alert("sdk");
    callSession.accept(); // e.newSession.reject() to reject the call
    alert("sdk...");
}// End Accept audio/video call
// Reject audio/video call
function rejectCall() {
    callSession.reject() //to reject the call
}// End reject audio/video call
//Publish presence status
var publishSession;
function publishPresence(status, note) {
    publishSession = sipStack.newSession('publish', {
        events_listener: {events: '*', listener: SipEventSession} // optional: '*' means all events
    });
    var contentType = 'application/pidf+xml';
    var content = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' +
        '<presence xmlns=\"urn:ietf:params:xml:ns:pidf\"\n' +
        ' xmlns:im=\"urn:ietf:params:xml:ns:pidf:im\"' +
        ' entity=\"sip:bob@example.com\">\n' +
        '<tuple id=\"s8794\">\n' +
        '<status>\n' +
        '   <basic>open</basic>\n' +
        '   <im:im>' + status + '</im:im>\n' +
        '</status>\n' +
        '<contact priority=\"0.8\">tel:+33600000000</contact>\n' +
        '<note  xml:lang=\"fr\">' + note + '</note>\n' +
        '</tuple>\n' +
        '</presence>';

    // send the PUBLISH request
    publishSession.publish(content, contentType, {
        expires: 200,
        sip_caps: [
            {name: '+g.oma.sip-im'},
            {name: '+sip.ice'},
            {name: 'language', value: '\"en,fr\"'}
        ],
        sip_headers: [
            {name: 'Event', value: 'presence'},
            {name: 'Organization', value: 'Doubango Telecom'}
        ]
    });
}// End Publish presence status
//Subscribe for presence status
var subscribeSession;
function SubscribePresence(to) {

    subscribeSession = sipStack.newSession('subscribe', {
        expires: 200,
        events_listener: {events: '*', listener: SipEventSession},
        sip_headers: [
            {name: 'Event', value: 'presence'}, // only notify for 'presence' events
            {name: 'Accept', value: 'application/xml'} // supported content types (COMMA-sparated)
        ],
        sip_caps: [
            {name: '+g.oma.sip-im', value: null},
            {name: '+audio', value: null},
            {name: 'language', value: '\"en,fr\"'}
        ]
    });

    // start watching for entity's presence status (You may track event type 'connected' to be sure that the request has been accepted by the server)
    subscribeSession.subscribe(to);
    alert("sub");
}//End Subscribe for presence status
//Send/receive SIP MESSAGE
var messageSession;
function sendMessage(user, message) {
    messageSession = sipStack.newSession('message', {
        events_listener: {events: '*', listener: eventsListener} // optional: '*' means all events
    });
    messageSession.send(user, message, 'text/plain;charset=utf-8');
}//End Send/receive SIP MESSAGE
//isWebRtc4AllSupported
function isWebRtc4AllSupported() {
    return DuoWebRtcSip.isWebRtc4AllSupported();
}
//isWebRtc4AllPluginOutdated
function isWebRtc4AllPluginOutdated() {
    return DuoWebRtcSip.isWebRtc4AllPluginOutdated();
}
//getWebRtc4AllVersion
function getWebRtc4AllVersion() {
    return DuoWebRtcSip.getWebRtc4AllVersion();
}
//isWebRtcSupported
function isWebRtcSupported() {
    return DuoWebRtcSip.isWebRtcSupported();
}
//getNavigatorFriendlyName
function getNavigatorFriendlyName() {
    return DuoWebRtcSip.getNavigatorFriendlyName();
}
//getSystemFriendlyName
function getSystemFriendlyName() {
    return DuoWebRtcSip.getSystemFriendlyName();
}
//isWebSocketSupported
function isWebSocketSupported() {
    return DuoWebRtcSip.isWebSocketSupported();
}
//isWebSocketSupported
function isWebSocketSupported() {
    return DuoWebRtcSip.isWebSocketSupported();
}
