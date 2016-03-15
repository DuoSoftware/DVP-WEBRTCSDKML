/**
 * Created by Rajinda on 2/10/2016.
 */


var app = angular.module('DuoSoftPhone',["ngMaterial", "ngRoute", "ngMessages","ngAnimate"]);


app.controller('MainController', function ($scope, $mdDialog, $mdMedia, $log,$location, phoneHandler) {

    var CallType = {
        video: 'call-audiovideo',
        screenshare: 'call-screenshare',
        audio: 'call-audio'
    };

    $scope.statusMsg = "login";
    var onIncomingCall=function (e) {

        /*

         callSession = e;
         StartRingTone();

         var sRemoteNumber = (e.getRemoteFriendlyName() || 'unknown');
         document.getElementById('txtCallStatus').innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";
         */


    };

    var    onEventsListener= function (e) {
        console.info(e.type);
        document.getElementById("statusMsg").innerHTML=e.type;
        if(e.type == 'connected'){
            document.getElementById("login").style.visibility=false;
            document.getElementById("phone").style.visibility=true;
            console.info('set path :'+ $location.path());
        }
    };


    var onSipEventSession= function (e) {
        console.info(e.type);
        document.getElementById("statusMsg").innerHTML=e.type;
    };

    var  onPresenceUpdate= function (e) {
        console.info(e.type);
        document.getElementById("statusMsg").innerHTML=e.type;

    };

    var   onErrorCallback= function (e) {
        alert("onErrorCallback");
    };

    var   onReceiveMessage= function (e) {
        alert("onErrorCallback");
    };

    $scope.initiatePhone = function () {
        var UserEvent = {
            onErrorCallback: onErrorCallback,
            onIncomingCall: onIncomingCall,
            onReceiveMessage: onReceiveMessage,
            onEventsListener: onEventsListener,
            onPresenceUpdate: onPresenceUpdate,
            onSipEventSession: onSipEventSession
        };

        var config = {
            mediaCache: false,
            videoLocalElementId: "videoLocal",
            videoRemoteElementId: "videoRemote",
            viewLocalScreencast: "localScreencast",
            audioRemoteId: "audioRemote"
        };
        phoneHandler.initiatePhone($scope.profile,UserEvent,config);
    };

    $scope.makeCall = function (call) {
        var configurations={
            callType:CallType.video,
                videoLocal:document.getElementById("videoLocal"),
             videoRemote:document.getElementById("videoRemote"),
             audioRemote:document.getElementById("audioRemote")
        };
        phoneHandler.makeCall(call.number,configurations);
    };

    $scope.hangUp = function (call) {
              phoneHandler.hangUp();
    };

    $scope.call = {};
    $scope.profile = {
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
});