/**
 * Created by Rajinda on 10/21/2015.
 */


var VideoLocalElement, VideoRemoteElement, ViewLocalScreencast, AudioRemote;

function ShowVideo(showLocal, showRemote) {
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
        uiVideoDisplayShowHide(true);
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
        fullScreen(false);
    }
}

function fullScreen(isFullScreen) {

    switch (e.type) {
        case 'connecting':
        case 'connected':
        {
            if (e.type == 'connected') {
                document.getElementById('btnRegister').disabled = true;
                document.getElementById('btnUnRegister').disabled = false;
                document.getElementById('btnSetStatus').disabled = false;
                document.getElementById('btnSubscribe').disabled = false;
                document.getElementById('txtRegStatus').innerHTML = "<i>" + e.description + "</i>";
                stopRingbackTone();
                stopRingTone();

            }
            if (isWebRtc4AllSupported()) { // IE don't provide stream callback
                ShowVideo(false, true);
                ShowVideo(true, true);
            }
            break;

        } // 'connecting' | 'connected'
        case 'terminating':
        case 'terminated':
        {
            document.getElementById('txtRegStatus').innerHTML = "<i>" + e.description + "</i>";
            break;

        } // 'terminating' | 'terminated'

        case 'm_stream_video_local_added':
        {
            /* if (e.session == oSipSessionCall) {
             uiVideoDisplayEvent(true, true);
             }*/
            ShowVideo(true, true);
            break;
        }
        case 'm_stream_video_local_removed':
        {
            ShowVideo(false, false);
            break;
        }
        case 'm_stream_video_remote_added':
        {
            ShowVideo(false, false);
            break;
        }
        case 'm_stream_video_remote_removed':
        {
            ShowVideo(false, false);
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
                ShowVideo(false, true);
                ShowVideo(true, true);
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
}
