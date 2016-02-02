var callSession;
var bHeld, bMute = false;
var i = 0;

// holds or resumes the call
function sipToggleHoldResume() {


    document.getElementById('btnHoldResume').disabled = true;
    document.getElementById('txtCallStatus').innerHTML = bHeld ? '<i>Resuming the call...</i>' : '<i>Holding the call...</i>';
    var i_ret = !bHeld ? UnholdCall : HoldCall;
    if (i_ret != 0) {
        document.getElementById('txtCallStatus').innerHTML = '<i>Hold / Resume failed</i>';
        document.getElementById('btnHoldResume').disabled = false;
        return;
    }
}

// Mute or Unmute the call
function sipToggleMute() {
    document.getElementById('txtCallStatus').innerHTML = bMute ? '<i>Mute the call...</i>' : '<i>Unmute the call...</i>';
    var i_ret = !bMute ? UnmuteCall : MuteCall;
    if (i_ret != 0) {
        document.getElementById('txtCallStatus').innerHTML = '<i>Mute / Unmute failed</i>';
        return;
    }

    document.getElementById('btnMute').value = bMute ? "Unmute" : "Mute";


}

function toggleFullScreen() {
    fullScreen(!document.getElementById('remoteVideoRaj').webkitDisplayingFullscreen);
}

function openKeyPad() {
    document.getElementById('divKeyPad').style.visibility = 'visible';
    document.getElementById('divKeyPad').style.left = ((document.body.clientWidth - C.divKeyPadWidth) >> 1) + 'px';
    document.getElementById('divKeyPad').style.top = '70px';
    document.getElementById('divGlassPanel').style.visibility = 'visible';
}

function closeKeyPad() {
    document.getElementById('divKeyPad').style.left = '0px';
    document.getElementById('divKeyPad').style.top = '0px';
    document.getElementById('divKeyPad').style.visibility = 'hidden';
    document.getElementById('divGlassPanel').style.visibility = 'hidden';
}

function StartRingTone() {
    try {
        document.getElementById('ringtone').play();
    }
    catch (e) {
    }
};

function stopRingTone() {
    try {
        document.getElementById('ringtone').pause();
    }
    catch (e) {
    }
};

function startRingbackTone() {
    try {
        document.getElementById('ringbacktone').play();
    }
    catch (e) {
    }
}

function stopRingbackTone() {
    try {
        document.getElementById('ringbacktone').pause();
    }
    catch (e) {
    }
}


function uiVideoDisplayEvent(b_local, b_added) {
    alert("333");
    if (b_added) {
        ShowVideo(b_local, b_added);
        var setVideo = false;
        if (b_local)
            setVideo = true;
        if (b_added)
            setVideo = true;
        alert("333");
        uiVideoDisplayShowHide(setVideo);
        alert("333");
    }
    else {
        alert("444");
        ShowVideo(b_local, b_added);
        alert("444");
        fullScreen(false);
    }
}

function uiVideoDisplayShowHide(b_show) {
    if (b_show) {
        document.getElementById('tdVideo').style.height = '340px';
        document.getElementById('divVideo').style.height = navigator.appName == 'Microsoft Internet Explorer' ? '100%' : '340px';

    }
    else {
        document.getElementById('tdVideo').style.height = '0px';
        document.getElementById('divVideo').style.height = '0px';

    }
    document.getElementById('btnFullScreen').disabled = !b_show;
}

//'divVideoLocal', 'divVideoRemote', 'divScreencastLocal',
function fullScreen(b_fs) {
    bFullScreen = b_fs;
    if (tsk_utils_have_webrtc4native() && bFullScreen && document.getElementById('divVideoRemote').webkitSupportsFullscreen) {
        if (bFullScreen) {
            document.getElementById('divVideoRemote').webkitEnterFullScreen();
        }
        else {
            document.getElementById('divVideoRemote').webkitExitFullscreen();
        }
    }
    else {
        if (tsk_utils_have_webrtc4npapi()) {
            try {
                if (window.__o_display_remote) window.__o_display_remote.setFullScreen(b_fs);
            }
            catch (e) {
                document.getElementById('divVideo').setAttribute("class", b_fs ? "full-screen" : "normal-screen");
            }
        }
        else {
            document.getElementById('divVideo').setAttribute("class", b_fs ? "full-screen" : "normal-screen");
        }
    }
}


var Test =
{
SendMsg: function(){

    sendMessage(document.getElementById("txtUser").value,document.getElementById("txtmsg").value);

},

    SetStatus: function () {

        publishPresence(document.getElementById('txtPhoneStatus').value,'Im Status', 'Duo Software');
        alert(document.getElementById('txtPhoneStatus').value);
    },

    Subscribe: function () {
        SubscribePresence(document.getElementById('txtPhoneStatus').value);
        alert(document.getElementById('txtPhoneStatus').value);
    },

    SipRegisterUA: function () {

        //(domainName, userName, sipUri, password, websocketUrl, outboundUrl, onIncomingCall, onReceiveMessage, onEventsListener, onSipEventSession, onPresenceUpdate, onErrorCallback, videoLocalElementId, videoRemoteElementId, viewLocalScreencast, audioRemoteId, mediaCache)
        SipRegister(document.getElementById('txtDomain').value, document.getElementById('txtPrivateIdentity').value, document.getElementById('txtPublicIdentity').value, document.getElementById('txtPassword').value, document.getElementById('txtWebsocketUrl').value, document.getElementById('txtOutboundUrl').value, Test.onIncomingCall, Test.onReceiveMessage, Test.onEventsListener, this.onSipEventSession, Test.onPresenceUpdate, Test.onErrorCallback, 'localVideoRaj', 'remoteVideoRaj', 'divScreencastLocal', 'audio_remote', true);
        //alert("SipRegisterUA.....");
    },

    SipUnRegisterUA: function () {
        SipUnregister("123")

    },

    onIncomingCall: function (e) {


        callSession = e;
        StartRingTone();

        var sRemoteNumber = (e.getRemoteFriendlyName() || 'unknown');
        document.getElementById('txtCallStatus').innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";


    },
    onReceiveMessage: function (e) {

        //console.info('SMS-content = ' + e.getContentString() + ' and SMS-content-type = ' + e.getContentType());
        document.getElementById("txtmsgr").innerHTML=e.getContentString();

        document.getElementById("txtmsgr").value=e.getContentString();

    },


    onEventsListener: function (e) {
        var SID = document.getElementById('txtRegStatus');
        SID.innerHTML = "Event :" + e.type;


    },


    onSipEventSession: function (e) {
        var SID = document.getElementById('txtRegStatus');
        SID.innerHTML = "Session : " + e.type;

        switch (e.type) {
            case 'connecting':
            case 'connected':
            {
                bHeld = true;
                if (e.type == 'connected') {
                    document.getElementById('btnRegister').disabled = true;
                    document.getElementById('btnUnRegister').disabled = false;
                    document.getElementById('btnSetStatus').disabled = false;
                    document.getElementById('btnSubscribe').disabled = false;
                    document.getElementById('txtRegStatus').innerHTML = "<i>" + e.description + "</i>";
                    stopRingbackTone();
                    stopRingTone();
                    document.getElementById('divCallOptions').style.opacity = 1;
                }
                if (isWebRtc4AllSupported()) { // IE don't provide stream callback
                    uiVideoDisplayShowHide(false, true);
                    uiVideoDisplayShowHide(true, true);
                }

                break;

            } // 'connecting' | 'connected'
            case 'terminating':
            case 'terminated':
            {
                document.getElementById('txtRegStatus').innerHTML = "<i>" + e.description + "</i>";
                if (isWebRtc4AllSupported()) { // IE don't provide stream callback
                    uiVideoDisplayShowHide(false, false);
                    uiVideoDisplayShowHide(false, false);
                }
                document.getElementById('divCallOptions').style.opacity = 0;
                break;

            } // 'terminating' | 'terminated'

            case 'm_stream_video_local_added':
            {
                /* if (e.session == oSipSessionCall) {
                 uiVideoDisplayEvent(true, true);
                 }*/
                uiVideoDisplayShowHide(true, true);
                break;
            }
            case 'm_stream_video_local_removed':
            {
                uiVideoDisplayShowHide(false, false);
                break;
            }
            case 'm_stream_video_remote_added':
            {
                uiVideoDisplayShowHide(false, false);
                break;
            }
            case 'm_stream_video_remote_removed':
            {
                uiVideoDisplayShowHide(false, false);
                break;
            }

            case 'm_stream_audio_local_added':
            case 'm_stream_audio_local_removed':
            case 'm_stream_audio_remote_added':
            case 'm_stream_audio_remote_removed':
            {
                break;
            }

            case 'i_ect_new_call':
            {

                break;
            }

            case 'i_ao_request':
            {
                var iSipResponseCode = e.getSipResponseCode();
                if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                    startRingbackTone();
                    document.getElementById('txtCallStatus').innerHTML = '<i>Remote ringing...</i>';
                }
                break;
            }

            case 'm_early_media':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Early media started</i>';
                break;
            }

            case 'm_local_hold_ok':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Call placed on hold</i>';
                break;
            }
            case 'm_local_hold_nok':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Failed to place remote party on hold</i>';
                break;
            }
            case 'm_local_resume_ok':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Call taken off hold</i>';
                if (isWebRtc4AllSupported()) { // IE don't provide stream callback yet
                    uiVideoDisplayShowHide(false, true);
                    uiVideoDisplayShowHide(true, true);
                }
                break;
            }
            case 'm_local_resume_nok':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Failed to unhold call</i>';
                break;
            }
            case 'm_remote_hold':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Placed on hold by remote party</i>';
                break;
            }
            case 'm_remote_resume':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Taken off hold by remote party</i>';
                break;
            }
            case 'm_bfcp_info':
            {
                document.getElementById('txtCallStatus').innerHTML = 'BFCP Info: <i>' + e.description + '</i>';
                break;
            }

            case 'o_ect_trying':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Call transfer in progress...</i>';
                break;
            }
            case 'o_ect_accepted':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Call transfer accepted</i>';
                break;
            }
            case 'o_ect_completed':
            case 'i_ect_completed':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Call transfer completed</i>';
                break;
            }
            case 'o_ect_failed':
            case 'i_ect_failed':
            {
                document.getElementById('txtCallStatus').innerHTML = '<i>Call transfer failed</i>';
                break;
            }
            case 'o_ect_notify':
            case 'i_ect_notify':
            {
                document.getElementById('txtCallStatus').innerHTML = "<i>Call Transfer: <b>" + e.getSipResponseCode() + " " + e.description + "</b></i>";
                break;
            }
            case 'i_ect_requested':
            {
                document.getElementById('txtCallStatus').innerHTML = "<i>Call transfer in progress...</i>";
                break;
            }
        }
    },

    onPresenceUpdate: function (e) {

        document.getElementById('txtStatus').innerHTML = 'PresenceUpdate' + i + e.getContentType();
        document.getElementById('txtStatus').value = "PresenceUpdate" + i + e.getContentType();
        i++;
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
                                //alert('Presence notification: Uri = ' + entityUri + ' status = ' + basicNode.textContent);
                                document.getElementById('txtSubStatus').innerHTML = ('Presence notification: Uri = ' + entityUri + ' status = ' + basicNode.textContent);
                                document.getElementById('txtSubStatus').value = ('Presence notification: Uri = ' + entityUri + ' status = ' + basicNode.textContent);

                            }
                        }
                    }
                }
            }
        }


    },
    onErrorCallback: function (e) {
        alert("onErrorCallback");
    },

    MakeMyCall: function () {
        //alert("No : " + document.getElementById('txtPhoneNumber').value);
        //videoLocalElementId, videoRemoteElementId, audioRemoteId, user
        //CallType{ call-screenshare, call-audiovideo, audio}
        makeCall(document.getElementById('txtPhoneNumber').value, CallType.video);


    },
    EndCalls: function () {
        stopRingbackTone();
        stopRingTone();
        rejectCall();
    },
    AnswerCall: function () {

        acceptCall();
        //alert("AnswerCall-uui");
    },

}



