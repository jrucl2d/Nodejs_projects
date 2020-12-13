"use strict";

// Set up media stream constant and parameters.

// In this codelab, you will be streaming video only: "video: true".
// Audio will not be streamed because it is set to "audio: false" by default.
const mediaStreamConstraints = {
  video: true,
};

// 제공 옵션
const offerOptions = {
  offerToReceiveVideo: 1,
};

// call의 시작 시간 기록 (peer간의 connection).
let startTime = null;

// stream이 들어갈 video elements
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
let localStream;
let remoteStream;
let localPeerConnection;
let remotePeerConnection;

// MediaStream에 관한 콜백함수(성공, 실패)
// local media stream 성공
function gotLocalMediaStream(mediaStream) {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
  trace("Received local stream.");
  callButton.disabled = false; // call 버튼 활성화
}
// local media stream 실패
function handleLocalMediaStreamError(error) {
  trace(`navigator.getUserMedia error: ${error.toString()}.`);
}
// remote media stream 성공
function gotRemoteMediaStream(event) {
  const mediaStream = event.stream;
  remoteVideo.srcObject = mediaStream;
  remoteStream = mediaStream;
  trace("Remote peer connection received remote stream.");
}

// 버튼들 설정
const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
startButton.addEventListener("click", startAction);
callButton.addEventListener("click", callAction);
hangupButton.addEventListener("click", hangupAction);

callButton.disabled = true;
hangupButton.disabled = true;

// 새로운 peer 후보와 연결 -> addIceCandidate()로 후보를 원격 피어 설명에 추가
function handleConnection(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate;

  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection); // 현재 peer의 상대 피어를 가져옴

    otherPeer
      .addIceCandidate(newIceCandidate)
      .then(() => {
        handleConnectionSuccess(peerConnection);
      })
      .catch((error) => {
        handleConnectionFailure(peerConnection, error);
      });

    trace(
      `${getPeerName(peerConnection)} ICE candidate:\n` +
        `${event.candidate.candidate}.`
    );
  }
}

// Start 버튼: local MediaStream을 생성
function startAction() {
  startButton.disabled = true;
  navigator.mediaDevices
    .getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream)
    .catch(handleLocalMediaStreamError);
  trace("Requesting local stream.");
}

// Call 버튼: peer connection을 생성
function callAction() {
  callButton.disabled = true;
  hangupButton.disabled = false;

  trace("Starting call.");
  startTime = window.performance.now();

  // Get local media stream tracks.
  const videoTracks = localStream.getVideoTracks();
  const audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    trace(`Using video device: ${videoTracks[0].label}.`);
  }
  if (audioTracks.length > 0) {
    trace(`Using audio device: ${audioTracks[0].label}.`);
  }

  const servers = null; // 여기에 STUN 및 TURN 서버를 지정할 수 있다.

  // Create peer connections and add behavior.
  localPeerConnection = new RTCPeerConnection(servers);
  trace("Created local peer connection object localPeerConnection.");

  localPeerConnection.addEventListener("icecandidate", handleConnection);
  localPeerConnection.addEventListener(
    "iceconnectionstatechange",
    handleConnectionChange // 로깅따리
  );

  remotePeerConnection = new RTCPeerConnection(servers);
  trace("Created remote peer connection object remotePeerConnection.");

  remotePeerConnection.addEventListener("icecandidate", handleConnection);
  remotePeerConnection.addEventListener(
    "iceconnectionstatechange",
    handleConnectionChange // 로깅따리
  );
  // 상대 peer의 비디오 스트림도 add stream해줌(element에 연결)
  remotePeerConnection.addEventListener("addstream", gotRemoteMediaStream);

  // local stream을 connection에 추가하고 connect에 create offer 추가
  localPeerConnection.addStream(localStream);
  trace("Added local stream to localPeerConnection.");

  trace("localPeerConnection createOffer start.");
  localPeerConnection
    .createOffer(offerOptions)
    .then(createdOffer)
    .catch(setSessionDescriptionError);
}

// hangup 버튼: call을 종료, connections을 닫고 peers을 reset
function hangupAction() {
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  trace("Ending call.");
}

/////////////////////////////////
//////////////////////////////
///////////////////////////
///////////////////////////// 이 아래로 그냥 helper 함수 볼필요 노

// Gets the "other" peer connection.
function getOtherPeer(peerConnection) {
  return peerConnection === localPeerConnection
    ? remotePeerConnection
    : localPeerConnection;
}

// Gets the name of a certain peer connection.
function getPeerName(peerConnection) {
  return peerConnection === localPeerConnection
    ? "localPeerConnection"
    : "remotePeerConnection";
}

// Logs an action (text) and the time when it happened on the console.
function trace(text) {
  text = text.trim();
  const now = (window.performance.now() / 1000).toFixed(3);

  console.log(now, text);
}

/////////////////////////////// 여기 아래로 다 로깅

// video stream의 작동들
// 비디오 element의 아이디와 크기를 로깅
function logVideoLoaded(event) {
  const video = event.target;
  trace(
    `${video.id} videoWidth: ${video.videoWidth}px, ` +
      `videoHeight: ${video.videoHeight}px.`
  );
}
// 비디오 스트리밍이 시작되면 시작되는 함수
function logResizedVideo(event) {
  logVideoLoaded(event);

  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    startTime = null;
    trace(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
  }
}
// 비디오 스트리밍 로깅
localVideo.addEventListener("loadedmetadata", logVideoLoaded);
remoteVideo.addEventListener("loadedmetadata", logVideoLoaded);
remoteVideo.addEventListener("onresize", logResizedVideo);
// RTC peer connection 관련 함수

// Logs that the connection succeeded.
function handleConnectionSuccess(peerConnection) {
  trace(`${getPeerName(peerConnection)} addIceCandidate success.`);
}
// Logs that the connection failed.
function handleConnectionFailure(peerConnection, error) {
  trace(
    `${getPeerName(peerConnection)} failed to add ICE Candidate:\n` +
      `${error.toString()}.`
  );
}
// Logs changes to the connection state.
function handleConnectionChange(event) {
  const peerConnection = event.target;
  console.log("ICE state change event: ", event);
  trace(
    `${getPeerName(peerConnection)} ICE state: ` +
      `${peerConnection.iceConnectionState}.`
  );
}
// Logs error when setting session description fails.
function setSessionDescriptionError(error) {
  trace(`Failed to create session description: ${error.toString()}.`);
}
// Logs success when setting session description.
function setDescriptionSuccess(peerConnection, functionName) {
  const peerName = getPeerName(peerConnection);
  trace(`${peerName} ${functionName} complete.`);
}
// Logs success when localDescription is set.
function setLocalDescriptionSuccess(peerConnection) {
  setDescriptionSuccess(peerConnection, "setLocalDescription");
}
// Logs success when remoteDescription is set.
function setRemoteDescriptionSuccess(peerConnection) {
  setDescriptionSuccess(peerConnection, "setRemoteDescription");
}
// Logs offer creation and sets peer connection session descriptions.
function createdOffer(description) {
  trace(`Offer from localPeerConnection:\n${description.sdp}`);

  trace("localPeerConnection setLocalDescription start.");
  localPeerConnection
    .setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(localPeerConnection);
    })
    .catch(setSessionDescriptionError);

  trace("remotePeerConnection setRemoteDescription start.");
  remotePeerConnection
    .setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(remotePeerConnection);
    })
    .catch(setSessionDescriptionError);

  trace("remotePeerConnection createAnswer start.");
  remotePeerConnection
    .createAnswer()
    .then(createdAnswer)
    .catch(setSessionDescriptionError);
}
// Logs answer to offer creation and sets peer connection session descriptions.
function createdAnswer(description) {
  trace(`Answer from remotePeerConnection:\n${description.sdp}.`);

  trace("remotePeerConnection setLocalDescription start.");
  remotePeerConnection
    .setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(remotePeerConnection);
    })
    .catch(setSessionDescriptionError);

  trace("localPeerConnection setRemoteDescription start.");
  localPeerConnection
    .setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(localPeerConnection);
    })
    .catch(setSessionDescriptionError);
}
