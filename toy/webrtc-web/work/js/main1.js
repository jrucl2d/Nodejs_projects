"use strict";

const mediaStreamConstraints = {
  video: true,
};

// stream이 들어갈 video element
const localVideo = document.querySelector("video");

// 사용할 local stream
let localStream;

// 성공
function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream;
  localVideo.srcObject = mediaStream;
}

// 실패
function handleLocalMediaStreamError(err) {
  console.log(`navigator.getUserMedia error : ${err}`);
}

navigator.mediaDevices
  .getUserMedia(mediaStreamConstraints)
  .then((mediaStream) => gotLocalMediaStream(mediaStream))
  .catch((err) => handleLocalMediaStreamError(err));
