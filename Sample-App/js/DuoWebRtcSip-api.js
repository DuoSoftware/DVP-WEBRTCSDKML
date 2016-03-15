/**
 * Created by Rajinda on 10/16/2015.
 */

var UserEvent = {};
var sipStack;
var registerSession;
var callSession;
var DomainName, UserName, SipUri, Password, WebsocketUrl, OutboundUrl = "";
var MediaCache = true;
var ConfigCall;
var VideoLocalElement, VideoRemoteElement, ViewLocalScreencast, AudioRemote;


var CallType = {
    video: 'call-audiovideo',
    screenshare: 'call-screenshare',
    audio: 'call-audio'
};
var publishSession;
var subscribeSession;
var messageSession;

/// API functions  and events


function readyCallback(e) {
    this.createSipStack();
}

function errorCallback(e) {
    UserEvent.onErrorCallback(e);
}

function PresenceUpdate(e) {
    UserEvent.onPresenceUpdate(e);
}

// events Liste ner
function eventsListener(e) {

    switch (e.type) {
        case 'starting':
        {
            UserEvent.onEventsListener(e);
            break;
        }
        case 'started':
        {
            login();
            break;
        }
        case 'connected':
        {
            duoWebPhone.publishPresence('Online', 'Online', 'Loged to System');
            UserEvent.onEventsListener(e);

            break;
        }
        case 'i_new_call':
        {
            callSession = e.newSession;

            // incoming audio/video call
            UserEvent.onIncomingCall(callSession);

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
            duoWebPhone.publishPresence('Offline', 'Offline', 'eventsListener');
            UserEvent.onEventsListener(e);
            sipStack = null;
            registerSession = null;
            callSession = null;

        }
        case 'failed_to_start':
        case 'failed_to_stop':
        case 'm_permission_requested':
        case 'm_permission_accepted':
        case 'm_permission_refused':

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
            UserEvent.onSipEventSession(e);
            duoWebPhone.publishPresence('Busy', 'imStatus', 'SipEventSession');
            break;
        }
        case 'i_ect_new_call':
        {
            UserEvent.onSipEventSession(e);
            break;
        }
        case 'terminating':
        case 'terminated':
        {

            if (e.session == registerSession) {

                callSession = null;
                registerSession = null;
            }
            else if (e.session == callSession) {
               duoWebPhone.uiVideoDisplayShowHide(false);
            }
            duoWebPhone.publishPresence('Idel', 'imStatus', 'SipEventSession');
            break;
        }
        case 'i_ao_request':
        case 'connecting':
        case 'm_stream_video_local_added':
        case 'm_stream_video_local_removed':
        case 'm_stream_video_remote_added':
        case 'm_stream_video_remote_removed':
        case 'm_stream_audio_local_added':
        case 'm_stream_audio_local_removed':
        case 'm_stream_audio_remote_added':
        case 'm_stream_audio_remote_removed':
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

// Create a SIP stack
function createSipStack() {

    // create SIP stack
    sipStack = new DuoWebRtcSip.Stack({
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
        events_listener: {events: '*', listener: eventsListener} // optional: '*' means all events
    });
    registerSession.register();
    // attachs video displays
    if (DuoWebRtcSip.isWebRtc4AllSupported()) {
        WebRtc4all_SetDisplays(VideoLocalElement, VideoRemoteElement, ViewLocalScreencast); // FIXME: move to DuoWebRtcSip.* API
    }
}// End Logging
// Making audio/video call

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


function tsk_utils_have_webrtc4native() {
    DuoWebRtcSip.tsk_utils_have_webrtc4native()
}

///

var duoWebPhone = {

    SipRegister: function (profile, callBackEvents, config) {


        //domainName, userName, sipUri, password, websocketUrl, outboundUrl
        // config ->videoLocalElementId, videoRemoteElementId, viewLocalScreencast, audioRemoteId, mediaCache
        // callBackEvents -> onIncomingCall, onReceiveMessage, onEventsListener, onSipEventSession, onPresenceUpdate, onErrorCallback
        UserEvent = {};
        DomainName = profile.server.domain;
        UserName = profile.authorizationName;
        SipUri = profile.publicIdentity;
        Password = profile.password;
        WebsocketUrl = profile.server.websocketUrl;
        OutboundUrl = profile.server.outboundProxy;
        MediaCache = config.mediaCache;
        VideoLocalElement = document.getElementById(config.videoLocalElementId);
        VideoRemoteElement = document.getElementById(config.videoRemoteElementId);
        ViewLocalScreencast = document.getElementById(config.viewLocalScreencast);
        AudioRemote = document.getElementById(config.audioRemoteId);


        UserEvent.onErrorCallback = callBackEvents.onErrorCallback;
        UserEvent.onIncomingCall = callBackEvents.onIncomingCall;
        UserEvent.onReceiveMessage = callBackEvents.onReceiveMessage;
        UserEvent.onEventsListener = callBackEvents.onEventsListener;
        UserEvent.onPresenceUpdate = callBackEvents.onPresenceUpdate;
        UserEvent.onSipEventSession = callBackEvents.onSipEventSession;

//videoLocalElementId, videoRemoteElementId, viewLocalScreencast, audioRemoteId
        ConfigCall = {
            audio_remote: AudioRemote,
            video_local: VideoLocalElement,
            video_remote: VideoRemoteElement,
            screencast_window_id: 0x00000000, // entire desktop
            bandwidth: {audio: undefined, video: undefined},
            video_size: {minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined},
            events_listener: {events: '*', listener: SipEventSession},
            sip_caps: [
                {name: '+g.oma.sip-im'},
                {name: 'language', value: '\"en,fr\"'}
            ]
        };

        DuoWebRtcSip.init(readyCallback, errorCallback);


    },

    SipUnregister: function (e) {
        sipStack.stop();
    },

    makeCall: function (user, callType) {


        if ((callType == CallType.video) || (CallType.screenshare == callType) || (CallType.audio == callType)) {

            //VideoLocalElement, VideoRemoteElement, ViewLocalScreencast, AudioRemote
            callSession = sipStack.newSession(callType, {//'call-audiovideo'
                video_local: VideoLocalElement,
                video_remote: VideoRemoteElement,
                audio_remote: AudioRemote,
                events_listener: {events: '*', listener: SipEventSession} // optional: '*' means all events
            });
            callSession.call(user);
        }
        else {
            throw new Error('Invalid Call Type.');
        }
    },

    HangUp: function () {
        if (callSession) {
            callSession.hangup({events_listener: {events: '*', listener: SipEventSession}});
        }
    },

    acceptCall: function () {

        callSession.accept(ConfigCall); // e.newSession.reject() to reject the call

    },

    rejectCall: function () {
        callSession.reject() //to reject the call
    },

    MuteCall: function () {
        return callSession.mute('audio'/*could be 'video'*/, true);
    },

    UnmuteCall: function () {
        return callSession.mute('audio'/*could be 'video'*/, false);
    },

    HoldCall: function () {

        return callSession.hold();
    },

    UnholdCall: function () {
        return callSession.resume();
    },

//Publish presence status

    publishPresence: function (status, imStatus, note) {

        publishSession = sipStack.newSession('publish', {
            events_listener: {events: '*', listener: PresenceUpdate} // optional: '*' means all events
        });
        var contentType = 'application/pidf+xml';
        var content = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' +
            '<presence xmlns=\"urn:ietf:params:xml:ns:pidf\"\n' +
            ' xmlns:im=\"urn:ietf:params:xml:ns:pidf:im\"' +
            ' entity=\"' + SipUri + '\">\n' +
            '<tuple id=\"s8794\">\n' +
            '<status>\n' +
            '   <basic>' + status + '</basic>\n' +
            '   <im:im>' + imStatus + '</im:im>\n' +
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
                {name: 'SIP-If-Match', value: 'yes'},
                {name: 'language', value: '\"en,fr\"'}
            ],
            sip_headers: [
                {name: 'Event', value: 'presence'},
                {name: 'Organization', value: 'DuoSoftware'}
            ]
        });

    },


    SubscribePresence: function (to) {

        subscribeSession = sipStack.newSession('subscribe', {
            expires: 200,
            events_listener: {events: '*', listener: PresenceUpdate},
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

    },


    sendMessage: function (user, message) {
        messageSession = sipStack.newSession('message', {
            events_listener: {events: '*', listener: eventsListener} // optional: '*' means all events
        });
        messageSession.send(user, message, 'text/plain;charset=utf-8');
    },

    uiVideoDisplayShowHide: function (b_show) {
        var o_elt_video = b_show ? VideoLocalElement : VideoRemoteElement;
        if (b_show) {
            o_elt_video.style.height = '340px';
            o_elt_video.style.height = navigator.appName == 'Microsoft Internet Explorer' ? '100%' : '340px';
        }
        else {
            VideoLocalElement.style.height = '0px';
            VideoRemoteElement.style.height = '0px';
        }
        /*btnFullScreen.disabled = !b_show;*/
    },
    ShowVideo: function (showLocal, showRemote) {
        var o_elt_video = showLocal ? VideoLocalElement : VideoRemoteElement;

        if (showRemote) {
            if (isWebRtc4AllSupported()) {
                if (showLocal) {
                    if (WebRtc4all_GetDisplayLocal()) WebRtc4all_GetDisplayLocal().style.visibility = "visible";
                    if (WebRtc4all_GetDisplayLocalScreencast()) WebRtc4all_GetDisplayLocalScreencast().style.visibility = "visible";

                }
                else {
                    if (WebRtc4all_GetDisplayRemote()) WebRtc4all_GetDisplayRemote().style.visibility = "visible";

                }
            }
            else {
                o_elt_video.style.opacity = 1;
            }
            this.uiVideoDisplayShowHide(true);
        }
        else {
            if (isWebRtc4AllSupported()) {
                if (showLocal) {
                    if (WebRtc4all_GetDisplayLocal()) WebRtc4all_GetDisplayLocal().style.visibility = "hidden";
                    if (WebRtc4all_GetDisplayLocalScreencast()) WebRtc4all_GetDisplayLocalScreencast().style.visibility = "hidden";

                }
                else {
                    if (WebRtc4all_GetDisplayRemote()) WebRtc4all_GetDisplayRemote().style.visibility = "hidden";
                }
            }
            else {
                o_elt_video.style.opacity = 0;
            }
            this.fullScreen(false);
        }
    },


    fullScreen: function (isFullScreen) {

        if (tsk_utils_have_webrtc4native() && isFullScreen && VideoRemoteElement.webkitSupportsFullscreen) {
            if (isFullScreen) {
                VideoRemoteElement.webkitEnterFullScreen();
            }
            else {
                VideoRemoteElement.webkitExitFullscreen();
            }
        }
        else {
            if (tsk_utils_have_webrtc4npapi()) {
                try {
                    if (window.__o_display_remote) window.__o_display_remote.setFullScreen(isFullScreen);
                }
                catch (e) { //divVideo.setAttribute("class", isFullScreen ? "full-screen" : "normal-screen");
                }
            }
            else {
                // divVideo.setAttribute("class", isFullScreen ? "full-screen" : "normal-screen");
            }
        }
    },

};


//////////////////////////////////////////////////////////// API ////////////////////////////////////////////////////////////

