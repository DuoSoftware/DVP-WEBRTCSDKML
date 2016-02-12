/**
 * Created by Rajinda on 2/10/2016.
 */


(function () {

    var phoneHandler = function ($http, $log) {

        var CallType = {
            video: 'call-audiovideo',
            screenshare: 'call-screenshare',
            audio: 'call-audio'
        };

        var registerSession;
        var sipStack;
        var callSession;


        var profile = {
            authorizationName: "",
            publicIdentity: "",
            password: "",
            displayName: "",
            server: {
                realm: "",
                websocketUrl: "",
                outboundProxy: "",
                enableRtcwebBreaker: ""
            }
        };

        var initiatePhone = function (userProfile, UserEvent, config) {

            duoWebPhone.SipRegister(userProfile, UserEvent, config);

        };

        var makeCall = function (number, configurations) {
            duoWebPhone.makeCall(number, CallType.video);
        };

        var acceptCall = function (e) {
            duoWebPhone.acceptCall();
        };

        var rejectCall = function (e) {
            duoWebPhone.rejectCall();
        };

        return {
            makeCall: makeCall,
            acceptCall: acceptCall,
            rejectCall: rejectCall,
            initiatePhone: initiatePhone
        };

    };

    var module = angular.module("DuoSoftPhone");
    module.factory("phoneHandler", phoneHandler);

}());
