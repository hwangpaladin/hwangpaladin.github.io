var ws_url = ""
var m3u8_url = ""
var mux_url = ""
var backendType = ""

var isOnline = null
var isLive = true
var liveVidUrl = ""
var vidUrl = ""
var assetArray = []
const numAssets = 3;
var destinationName = ""
var globalCity = ""
var globalCanViewVideos = false
var globalIsAdmin = false
var globalCanMultiView = false
var map;


var listOfDronesInGroup = []
var compiledDroneData = {}

var localIsOnline = {}

var localMarkers = {}
var localLats = {}

var droneDataRef = null;
var globalIsDelivery = false;
var mavsdkDataRef = null;
var dronePositionDataRef = null;
var droneStateDataRef = null;

var gimbal_yaw = 0;


//todo: clean this up so that there's a seperate listener per value to decrease load time

function startGettingDroneData() {
    dronePositionDataRef = firebase.database().ref("drone_position")
    droneStateDataRef = firebase.database().ref("drone_status")
    mavsdkDataRef = firebase.database().ref()
    mavsdkDataRef.on('value', function (snapshot, city) {
        console.log("yerrrrrrrrrrr" + snapshot.child("alt_offset").val())
        var destLocation = new google.maps.LatLng(snapshot.child("dest_lat").val(), snapshot.child("dest_long").val())
        var droneLocation = new google.maps.LatLng(snapshot.child("drone_position").child("drone_lat").val(), snapshot.child("drone_position").child("drone_long").val())
        gimbal_pitch = snapshot.child("gimbal_pitch").val();
        gimbal_yaw = snapshot.child("gimbal_yaw").val();
        updateMapWithLocations(droneLocation, destLocation)
        updateActiveAutonomousButton(snapshot.child("send_mode").val())
        updateDroneTexts(roundThisNumber(snapshot.child("drone_status").child("battery_percent").val() * 100),
            roundThisNumber(snapshot.child("drone_position").child("drone_alt").val()),
            roundThisNumber(snapshot.child("drone_position").child("drone_horz_velocity").val()))
    })
}

function roundThisNumber(number) {
    return Math.round(number * 10) / 10
}

function updateMapWithLocations(dronelocation, destinationlocation) {
    var droneImage = {
        url: "img/drone.png",
        size: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 15)
    }
    var icons = {
        url: "img/drone.svg",
        scale: 1,
    }

    if (localMarkers[globalCity]) {
        localMarkers[globalCity].setIcon(droneImage)
        localMarkers[globalCity].setPosition(dronelocation)
    } else {
        var markertest = new google.maps.Marker({
            position: dronelocation,
            map: map,
            icon: droneImage,
            draggable: false
        });
        localMarkers[globalCity] = markertest
    }

    if (localMarkers["destination"]) {
        //localMarkers["modifiedCityName"].setIcon(droneImage)
        localMarkers["destination"].setPosition(destinationlocation)
    } else {
        var markertest = new google.maps.Marker({
            position: destinationlocation,
            map: map,
            draggable: false
        });
        localMarkers["destination"] = markertest
    }

    if (autoZoom) {
        moveMapPosition()
    }
    updateMapButtonColors()
}

function updateDroneTexts(battery, altitude, speed) {
    var Batt = document.getElementById("droneBattText")
    Batt.innerHTML = "Batt: " + battery + "%"
    var Alt = document.getElementById("droneAltText")
    Alt.innerHTML = "Alt: " + altitude + "m"
    var Speed = document.getElementById("droneSpeedText")
    Speed.innerHTML = "Speed: " + speed + "m/s"
}

function startDroneDataListeners(city, label) {

    var modifiedCityName = city.replace(/\s+/g, ''); //removes the spaces because apaparently you can't have spaces
    addDroneViewLayout(modifiedCityName)

    var videoBlock = document.getElementById(globalCity + "Block")
    videoBlock.style.display = "block"
    makeElementsVisible();
    //joinDailyCall();
    main();

    droneDataRef = firebase.database().ref("AS6" + "/Drone Data/")
    droneDataRef2 = firebase.database().ref("AS6" + "/isDelivery")
    droneDataRef2.on('value', function (snapshot, city) {
        if (snapshot.val()) {
            globalIsDelivery = snapshot.val()
        }
    })

    console.log("this is what is running2")

    startGettingDroneData();

    droneDataRef.on('value', function (snapshot, city) {
        // var droneDatas = {
        //     cityName: snapshot.child("droneCity").val(),
        //     isOnline: snapshot.child("isOnline").val(),
        //     battery: snapshot.child("droneBatteryLevel").val(),
        //     altitude: snapshot.child("droneAlt").val(),
        //     speed: snapshot.child("droneSpeed").val(),
        //     destination: snapshot.child("destinationName").val(),
        //     liveStreamURL: snapshot.child("wsUrl").val(),
        //     droneLat: snapshot.child("droneLat").val(),
        //     droneLong: snapshot.child("droneLong").val(),
        //     droneHeading: snapshot.child("droneHeading").val(),
        //     m3u8Url: snapshot.child("m3u8Url").val()
        // }

        // compiledDroneData[modifiedCityName] = droneDatas;

        // var isThisDroneOnline = snapshot.child("isOnline").val()

        // var sendMode = snapshot.child("sendMode").val()
        // //console.log("Asdfasdfasdf + " + sendMode)
        // updateActiveAutonomousButton(sendMode)

        // localIsOnline[modifiedCityName] = snapshot.child("isOnline").val();
        // // startWowzaPlayerEach(modifiedDroneData + 'Player',
        // //     snapshot.child("wsUrl").val(),
        // //     snapshot.child("m3u8Url").val())
        // var videoBlock = document.getElementById(globalCity + "Block")
        // videoBlock.style.display = "block"
        // console.log("this is what is running")
        // makeElementsVisible();
        // join2();


        // var droneImage = {
        //     url: "img/drone.png",
        //     size: new google.maps.Size(30, 30),
        //     origin: new google.maps.Point(0, 0),
        //     anchor: new google.maps.Point(15, 15)
        // }
        // var icons = {
        //     url: "img/drone.svg",
        //     scale: 1,
        // }
        // if (isThisDroneOnline) {
        // var newLatLng = new google.maps.LatLng(snapshot.child("droneLat").val(),
        //     snapshot.child("droneLong").val());

        // if (localMarkers[modifiedCityName]) {
        //     localMarkers[modifiedCityName].setIcon(droneImage)
        //     localMarkers[modifiedCityName].setPosition(newLatLng)
        // } else {
        //     var markertest = new google.maps.Marker({
        //         position: newLatLng,
        //         map: map,
        //         icon: droneImage,
        //         draggable: false
        //     });
        //     localMarkers[modifiedCityName] = markertest
        // }

        // var newLatLng2 = new google.maps.LatLng(snapshot.child("destLat").val(),
        //     snapshot.child("destLong").val());

        // if (localMarkers["destination"]) {
        //     //localMarkers["modifiedCityName"].setIcon(droneImage)
        //     localMarkers["destination"].setPosition(newLatLng2)
        // } else {
        //     var markertest = new google.maps.Marker({
        //         position: newLatLng2,
        //         map: map,
        //         draggable: false
        //     });
        //     localMarkers["destination"] = markertest
        // }

        // }
        // if (autoZoom) {
        //     moveMapPosition()
        // }
        // updateMapButtonColors()
    });
}

function makeElementsVisible() {
    var leftSide = document.getElementById("leftSide")
    var rightSide = document.getElementById("liveStreamWindows")
    var offlineImage = document.getElementById("offlineImage")
    leftSide.style.display = "block"
    rightSide.style.display = "block"
    offlineImage.style.display = "none"
}

function moveMapPosition() {
    var NumberOfOnline = 0;
    var leftMost;
    var rightMost;
    var topMost;
    var bottomMost;
    var bounds = new google.maps.LatLngBounds();
    for (var mapMarker in localMarkers) {
        if (localMarkers[mapMarker]) {
            bounds.extend(localMarkers[mapMarker].position);
            NumberOfOnline++
        }
    }
    if (NumberOfOnline > 1) {
        map.fitBounds(bounds)
        if (map.getZoom() > 15.6) {
            map.setZoom(15.6)
        }
    } else if (NumberOfOnline > 0) {
        map.setCenter(bounds.getCenter());
        map.setZoom(15.6)
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 0,
            lng: 0
        },
        zoom: 8,
        disableDefaultUI: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    });
}


function configureFirebase() {
    var config = {
        apiKey: "AIzaSyAQgsQzz2xn4xyNAg9YVFO0W871_AEHvHw",
        authDomain: "paladintest-6a6ba.firebaseapp.com",
        databaseURL: "https://paladinm690b.firebaseio.com/",
        projectId: "paladintest-6a6ba",
        storageBucket: "paladintest-6a6ba.appspot.com",
        messagingSenderId: "1002565407071",
        appId: "1:1002565407071:web:93900093e126daaa9826ea"
    };
    firebase.initializeApp(config);
    firebase.analytics();
}

function getFirebaseUserInfo(user) {

    if (user) {

        // force refresh the token to show new claims
        user.getIdToken(true)

        // print off info
        user.getIdTokenResult().then((idTokenResult) => {
            console.log("token gotten")
        }).catch((error) => {
            console.log(error);
        });
    } else {
        console.log("No user signed in")
    }
}

var globalMultiView
var listOfDronesInGroup = []
var globalGroupAdmin = false;

function startWatchtower() {
    initMapFunctions()
    globalCity = "MAVSDK"
    console.log("User found3- starting listener for " + globalCity)
    startDroneDataListeners(globalCity)
}

function submitClick(name) {
    var destinationNameLabel = document.getElementById("destinationNameLabel");
    window.location.href = "https://paladindrones.io/livestream?multiviewredirect=" + (name);
}

function addDroneViewLayout(cityName) {
    var videocontainer = document.createElement("div");
    videocontainer.setAttribute('class', 'nested2')

    var nestedLayer = document.createElement("div")
    nestedLayer.setAttribute('class', 'nested')
    nestedLayer.setAttribute('id', cityName + 'Block')
    nestedLayer.setAttribute('style', 'display: none')
    //videocontainer.setAttribute('onClick', 'submitClick("' + cityName + '")')

    var firstHalf = document.createElement("div")
    firstHalf.setAttribute('class', 'test1')

    var videoPlayer = document.createElement("div")
    videoPlayer.setAttribute('class', 'wowzaPlayer')
    videoPlayer.setAttribute('id', cityName + 'Player')
    firstHalf.appendChild(videoPlayer)

    var secondHalf = document.createElement("div")
    secondHalf.setAttribute('class', 'test')

    var droneTitle = document.createElement("div")
    droneTitle.setAttribute('class', 'droneTitle')
    droneTitle.setAttribute('id', cityName + 'Title')
    secondHalf.appendChild(droneTitle)

    var droneDest = document.createElement("div")
    droneDest.setAttribute('class', 'droneInfo')
    droneDest.setAttribute('id', cityName + 'Dest')
    secondHalf.appendChild(droneDest)

    var droneBatt = document.createElement("div")
    droneBatt.setAttribute('class', 'droneInfo')
    droneBatt.setAttribute('id', cityName + 'Batt')
    secondHalf.appendChild(droneBatt)

    var droneAlt = document.createElement("div")
    droneAlt.setAttribute('class', 'droneInfo')
    droneAlt.setAttribute('id', cityName + 'Alt')
    secondHalf.appendChild(droneAlt)

    var droneSpeed = document.createElement("div")
    droneSpeed.setAttribute('class', 'droneInfo')
    droneSpeed.setAttribute('id', cityName + 'Speed')
    secondHalf.appendChild(droneSpeed)

    videocontainer.appendChild(firstHalf);
    //videocontainer.appendChild(secondHalf);

    nestedLayer.appendChild(videocontainer)

    var element = document.getElementById("liveStreamWindows");
    element.prepend(nestedLayer)
}

function goToHomepage() {
    let input = document.createElement("input");
    input.style.opacity = "0";
    input.style["pointer-events"] = "none";
    document.body.appendChild(input);
    input.value = "https://paladindrones.io/login/?login&code=airs_6&temp=" + makeid(26);
    input.focus();
    input.select();
    document.execCommand('copy');
    alert('Sharing Code Copied!')
    //window.location.href = "https://paladindrones.io/login";
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function initAutocomplete() {

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        var newLatLng;
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            newLatLng = place.geometry.location
        });

        if (mavsdkDataRef && newLatLng) {
            mavsdkDataRef.child("dest_lat").set(newLatLng.lat())
            mavsdkDataRef.child("dest_long").set(newLatLng.lng())
        }
        autoZoom = true;
    });
}

//what code runs on android on button click

//GOTODEST = 0, GOHOME = 1, TAKEOFF = 2, SEARCH = 3, STANDBY = 4, START = 5, DJIRTH = 6, TENT = 7, AUTORTH = 8
//, KIKIGOTODEST = 9, KIKIGOHOME = 10, LAND = 11, LOCATELANDINGPAD = 12;
function updateActiveAutonomousButton(mode, outside) {
    var start = document.getElementById("startBtn")
    var stop = document.getElementById("stopBtn")
    var rth = document.getElementById("rthBtn")

    if (mode == 5 || mode == 0 || mode == 9) { //start
        start.className = "button selectedButton"
        stop.className = "button unselectedButton"
        rth.className = "button unselectedButton"
        if (outside) {
            mavsdkDataRef.child("send_mode").set(5)
            console.log(mode)
        }
    }
    if (mode == 4) { //stop
        start.className = "button unselectedButton"
        stop.className = "button selectedButton"
        rth.className = "button unselectedButton"
        if (outside) {
            mavsdkDataRef.child("send_mode").set(4)
            //mavsdkDataRef.child("cancelGoHome").set(true)
            console.log(mode)
        }
    }
    if (mode == 1 || mode == 10 || mode == 6 || mode == 11) { //rth
        start.className = "button unselectedButton"
        stop.className = "button unselectedButton"
        rth.className = "button selectedButton"
        if (outside) {
            //rth = if delivery kiki otherwise GOHOME
            if (globalIsDelivery) {
                mavsdkDataRef.child("send_mode").set(10)
            } else {
                mavsdkDataRef.child("send_mode").set(1)
            }
            console.log(mode)
        }
    }
}

var autoZoom = true;
var dropMarker = false;

function initMapFunctions() {
    initMap()
    initAutocomplete()
    initMapClick()
    initMapDrag()
    initGoFars()
}

function initGoFars() {
    var mapButtons = document.getElementById('mapButtonBar');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(mapButtons);
}

function initMapClick() {
    map.addListener('click', function (e) {
        if (dropMarker) {
            autoZoom = false;
            mavsdkDataRef.child("dest_lat").set(e.latLng.lat())
            mavsdkDataRef.child("dest_long").set(e.latLng.lng())
        }
    })
}

function initMapDrag() {
    map.addListener('drag', function () {
        autoZoom = false;
        updateMapButtonColors()
    })
}

function toggleDropMarker() {
    dropMarker = !dropMarker
    console.log(dropMarker)
    updateMapButtonColors()
}

function toggleAutoZoom() {
    autoZoom = !autoZoom
    console.log(autoZoom)
    updateMapButtonColors()
    moveMapPosition()
}

function updateMapButtonColors() {
    var autoZoomButton = document.getElementById('autoZoomButton');
    var dropMarkerButton = document.getElementById('dropMarkerButton');
    if (dropMarker) {
        dropMarkerButton.className = "mapButton selectedButton"
    } else {
        dropMarkerButton.className = "mapButton unselectedButton"
    }
    if (autoZoom) {
        autoZoomButton.className = "mapButton selectedButton"
    } else {
        autoZoomButton.className = "mapButton unselectedButton"
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}
var globalMultviewRedirect = false;

function checkUrlForAssetId() {

    if (getQueryVariable("assetId")) {
        playVideoFromUrl(getQueryVariable("assetId"))
    } else if (getQueryVariable("multiviewredirect")) {
        globalMultviewRedirect = true;
    } else {
        //console.log("no video to log")
    }
}

function isCityPartofClaims(claims, city) {
    listOfDronesInGroup.push(globalCity);
    if (globalMultiView) {
        listOfDronesInGroup.push(claims.city2)
        listOfDronesInGroup.push(claims.city3)
        listOfDronesInGroup.push(claims.city4)
        listOfDronesInGroup.push(claims.city5)
        listOfDronesInGroup.push(claims.city6)
        listOfDronesInGroup.push(claims.city7)
    }

    for (i = 0; i < listOfDronesInGroup.length; i++) {
        var modifiedCityName = listOfDronesInGroup[i].replace(/\s+/g, '');
        var mod2 = city.replace(/\s+/g, '');
        if (modifiedCityName == mod2) {
            return true
        }
    }
    return false;
}

configureFirebase()
startWatchtower()
// setupAuthListener()
//webrtc section

// var client = AgoraRTC.createClient({
//     mode: "rtc",
//     codec: "vp8"
// });

// var localTracks = {
//     videoTrack: null,
//     audioTrack: null
// };
// var remoteUsers = {};
// // Agora client options
// var options = {
//     appid: "534d12af0b034c9593aa3897b83e73ab",
//     channel: "testrtc01",
//     uid: null,
//     token: "006534d12af0b034c9593aa3897b83e73abIADCKjZPpRQqbtPjxayTvHSEENBOWMIfo31Nhlp33204rR1qOD0AAAAAEADqgOQ95SNRYAEAAQDkI1Fg"
// };

// async function join() {
//     // add event listener to play remote tracks when remote user publishs.
//     client.on("user-published", handleUserPublished);
//     client.on("user-unpublished", handleUserUnpublished);

//     await client.join(options.appid, options.channel, options.token || null);
//     console.log("publish success");
// }

// async function leave() {
//     for (trackName in localTracks) {
//         var track = localTracks[trackName];
//         if (track) {
//             track.stop();
//             track.close();
//             localTracks[trackName] = undefined;
//         }
//     }

//     remoteUsers = {};

//     // leave the channel
//     await client.leave();
//     console.log("client leaves channel success");
// }

// async function subscribe(user, mediaType) {
//     const uid = user.uid;
//     // subscribe to a remote user
//     await client.subscribe(user, mediaType);
//     console.log("subscribe success");
//     if (mediaType === 'video') {
//         // Get `RemoteVideoTrack` in the `user` object.
//         const remoteVideoTrack = user.videoTrack;

//         // // Dynamically create a container in the form of a DIV element for playing the remote video track.
//         // const playerContainer = document.createElement("div");
//         // // Specify the ID of the DIV container. You can use the `uid` of the remote user.
//         // playerContainer.id = user.uid.toString();
//         // playerContainer.style.width = "1920px";
//         // playerContainer.style.height = "1080px";
//         // document.body.append(playerContainer);

//         // remoteVideoTrack.play(playerContainer);

//         //TODO: make this not be hard coded lmfao
//         var videoRTC = document.getElementById(globalCity + "Player")
//         // videoRTC.style.width = "1280px";
//         // videoRTC.style.height = "720px";
//         var height = videoRTC.clientHeight + "px";
//         var width = videoRTC.clientWidth + "px";
//         console.log("ASDFASDF")
//         videoRTC.style.width = width;
//         videoRTC.style.height = height;

//         remoteVideoTrack.play(videoRTC);

//         console.log("should have ran")
//     }
//     if (mediaType === 'audio') {
//         //user.audioTrack.play();
//     }
// }

// function handleUserPublished(user, mediaType) {
//     const id = user.uid;
//     remoteUsers[id] = user;
//     subscribe(user, mediaType);
//     console.log("this maybe ran")
// }

// function handleUserUnpublished(user) {
//     const id = user.uid;
//     delete remoteUsers[id];
// }

//join()

//daily.co

var callFrame;

function joinDailyCall() {
    //TODO: make this not be hard coded lmfao
    var videoRTC = document.getElementById(globalCity + "Player")
    // videoRTC.style.width = "1280px";
    // videoRTC.style.height = "720px";
    var height = videoRTC.clientHeight + "px";
    var width = videoRTC.clientWidth + "px";
    console.log("ASDFASDF")
    videoRTC.style.width = width;
    videoRTC.style.height = height;

    callFrame = window.DailyIframe.createFrame(videoRTC);
    callFrame.join({
        url: 'https://paladindrones.daily.co/hamiltontest'
    })
    //TODO: add some sort of await after call frame is joined to stop showing local video
    //callFrame.setShowLocalVideo(false);
}

function leave2() {
    if (callFrame != null) {
        callFrame.leave();
    }
}


async function main() {
    // CHANGE THIS TO A ROOM WITHIN YOUR DAILY ACCOUNT
    const ROOM_URL = 'https://paladindrones.daily.co/hamiltontest';

    window.call = DailyIframe.createCallObject({
        url: ROOM_URL,
        videoSource: false,
        audioSource: false,
    });

    //   call.on('joined-meeting', () => {
    //     console.log('[JOINED MEETING]');
    //     document.getElementById('session-state-display').innerHTML = 'joined';
    //     console.log('set to joined');
    //   });
    //   call.on('left-meeting', () => {
    //     console.log('[LEFT MEETING]');
    //     document.getElementById('session-state-display').innerHTML = 'left';
    //     document.querySelectorAll('video').forEach((el) => el.remove());
    //     document.querySelectorAll('audio').forEach((el) => el.remove());
    //   });
    //   call.on('error', (e) => {
    //     console.log('[ERROR]', e);
    //     document.getElementById('session-state-display').innerHTML =
    //       'error -> ' + e.toString();
    //   });

    call.on('track-started', displayTrack);
    call.on('track-stopped', destroyTrack);

    //setInterval(updateStatsDisplay, 3000);
    joinRoom();
}

async function joinRoom() {
    await call.join();
}

async function leaveRoom() {
    await call.leave();
}

// ----

function displayTrack(evt) {
    console.log('[TRACK STARTED]', evt);
    if (evt.track.kind === 'video') {
        displayVideo(evt);
    } else {
        playAudio(evt);
    }
}

function displayVideo(evt) {
    console.log(evt);
    if (!(evt.track.kind === 'video')) {
        return;
    }
    let videosDiv = document.getElementById(globalCity + "Player")
    let videoEl = document.createElement('video');
    videosDiv.appendChild(videoEl);
    videoEl.style.width = '100%';
    videoEl.muted = true;
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    // videoEl.controls = "true";

    videoEl.srcObject = new MediaStream([evt.track]);
    
    // videoEl.play();
}

function playAudio(evt) {
    if (evt.participant.local) {
        return;
    }
    let audioEl = document.createElement('audio');
    document.body.appendChild(audioEl);
    audioEl.srcObject = new MediaStream([evt.track]);
    audioEl.play();
}

function destroyTrack(evt) {
    console.log(
        '[TRACK STOPPED]',
        (evt.participant && evt.participant.session_id) || '[left meeting]',
        evt.track.kind
    );

    let els = Array.from(document.getElementsByTagName('video')).concat(
        Array.from(document.getElementsByTagName('audio'))
    );
    for (let el of els) {
        if (el.srcObject && el.srcObject.getTracks()[0] === evt.track) {
            el.remove();
        }
    }
}

//change gimbal by a specific value up or doww, and keeps it between values of -360 to 360
function gimbalChange(changeValue) {
    var newGimbalPitch = gimbal_pitch + changeValue;
    if (newGimbalPitch < -360) newGimbalPitch = -360;
    if (newGimbalPitch > 360) newGimbalPitch = 360;
    mavsdkDataRef.child("gimbal_pitch").set(newGimbalPitch)
}

//change zoom by a spceific zoom value
function changeZoom(changeValue) {
    var newGimbalZoom = gimbal_yaw + changeValue;
    // if (newGimbalPitch < -360) newGimbalPitch = -360;
    // if (newGimbalPitch > 360) newGimbalPitch = 360;
    mavsdkDataRef.child("gimbal_yaw").set(newGimbalZoom)
}

function updateGimbalValue() {
    return gimbal_pitch;
}

var gimbal_pitch = 0;

//set tempo to positive to go up, usually 60, and negative to go down, -60. time is in milliseconds
function changeGimbalPitchTime(tempo, time) {
    mavsdkDataRef.child("gimbal_pitch").set(tempo)
    setTimeout(function () {
        mavsdkDataRef.child("gimbal_pitch").set(0);
    }, time);
    console.log("ya this ran now")
}

//set tempo to positive to zoom out, usually 90, and negative to zoom in, -90. time is in milliseconds
function changeCameraZoom(tempo, time) {
    mavsdkDataRef.child("gimbal_yaw").set(tempo)
    setTimeout(function () {
        mavsdkDataRef.child("gimbal_yaw").set(0);
    }, time);
    console.log("nah this ran")
}

// setInterval(function() {
//     window.location.reload();
//   }, 1000*60*5); //reset the page every 5 minutes