/**
 * Created by Rajinda on 10/16/2015.
 */

var UserEvent = {};
var sipStack;
var registerSession;
var callSession;
var DomainName, UserName, SipUri, Password, WebsocketUrl, OutboundUrl = "";

function SipRegister(domainName, userName, sipUri, password, websocketUrl, outboundUrl, onIncomingCall, onReceiveMessage, onEventsListener, onSipEventSession, onPresenceUpdate, onErrorCallback) {


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
    DuoWebRtcSip.init(this.readyCallback, this.errorCallback);


}

function SipUnregister() {
    this.sipStack.stop();
}
function readyCallback(e) {

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
            // incoming audio/video call
            UserEvent.onIncomingCall(e);
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
            UserEvent.onEventsListener(e);
            publishPresence();
            break;
        }
        case 'connected':
        {
            UserEvent.onEventsListener(e);
            publishPresence();
            break;
        }
        case 'i_ect_new_call':
        {
            UserEvent.onIncomingCall(e);
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
            break;
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
    sipStack = new DuoWebRtcSip.Stack({
            realm: DomainName, // mandatory: domain name
            impi: UserName, // mandatory: authorization name (IMS Private Identity)
            impu: SipUri, // mandatory: valid SIP Uri (IMS Public Identity)
            password: Password, // optional
            display_name: UserName, // optional
            websocket_proxy_url: WebsocketUrl, // optional
            outbound_proxy_url: OutboundUrl, // optional
            enable_rtcweb_breaker: false, // optional
            events_listener: {events: '*', listener: eventsListener}, // optional: '*' means all events
            sip_headers: [
// optional
                {name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0'},
                {name: 'Organization', value: 'Duo SOftware'}
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
function makeCall(videoLocalElementId, videoRemoteElementId, audioRemoteId, user) {
    callSession = sipStack.newSession('call-audiovideo', {
        video_local: videoLocalElementId,
        video_remote: videoRemoteElementId,
        audio_remote: audioRemoteId,
        events_listener: {events: '*', listener: eventsListener} // optional: '*' means all events
    });
    callSession.call(user);
}// End Making audio/video call
// Accept audio/video call
function acceptCall(session) {
    session.newSession.accept(); // e.newSession.reject() to reject the call
}// End Accept audio/video call
// Reject audio/video call
function rejectCall(session) {
    session.newSession.reject() //to reject the call
}// End reject audio/video call
//Publish presence status
var publishSession;
function publishPresence(status, note) {
    publishSession = sipStack.newSession('publish', {
        events_listener: {events: '*', listener: eventsListener} // optional: '*' means all events
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
function subscribePresence(to) {
    subscribeSession = sipStack.newSession('subscribe', {
        expires: 200,
        events_listener: {events: '*', listener: eventsListener},
        sip_headers: [
            {name: 'Event', value: 'presence'}, // only notify for 'presence' events
            {name: 'Accept', value: 'application/pidf+xml'} // supported content types (COMMA-sparated)
        ],
        sip_caps: [
            {name: '+g.oma.sip-im', value: null},
            {name: '+audio', value: null},
            {name: 'language', value: '\"en,fr\"'}
        ]
    });
    // start watching for entity's presence status (You may track event type 'connected' to be sure that the request has been accepted by the server)
    subscribeSession.subscribe(to);
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
