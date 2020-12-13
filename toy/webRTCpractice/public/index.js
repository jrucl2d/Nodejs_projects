// FE WebRTC 작동 부분 -> WebRTC를 쉽게 사용하도록 해주는 peerjs 라이브러리를 사용
const socket = io("/");
const peer = new Peer(undefined, {
  host: "/",
  port: "8001",
});
const videoGrid = document.querySelector("#video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true; // 나 자신의 소리는 mute

const joinedPeers = {}; // 참여한 peer들을 저장

// peer server에 연결되어 id를 부여받으면
peer.on("open", (id) => {
  // 서버에게 join-room이라는 이벤트를 emit. 인자로 room id, user id를 전송
  socket.emit("join-room", ROOM_ID, id);
});

// 자신의 video를 연결
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoSteram(myVideo, stream);

    // 새 user는 자신의 stream응 응답으로 보내주고 기존 user의 steram을 자신의 stream에 추가
    peer.on("call", (call) => {
      call.answer(stream);
      const oldUserVideo = document.createElement("video");
      call.on("stream", (oldUserVideoStream) => {
        addVideoSteram(oldUserVideo, oldUserVideoStream);
      });
    });

    // 만약 새로운 유저가 방문하게 되면 추가
    socket.on("user-connected", (userID) => {
      console.log("zzz");
      connectToNewUser(userID, stream);
    });
  });

// 서버에서 해당 id를 가진 user가 떠났음을 알려주면 스트림에서 해당 user 제거
socket.on("user-disconnected", (userID) => {
  console.log(userID);
  if (joinedPeers[userID]) joinedPeers[userID].close();
});

function addVideoSteram(myVideo, stream) {
  myVideo.srcObject = stream;
  myVideo.addEventListener("loadedmetadata", () => myVideo.play());
  videoGrid.append(myVideo);
}

function connectToNewUser(userID, stream) {
  const call = peer.call(userID, stream); // 새 user에게 call하고 자신의 stream을 전송
  const newUserVideo = document.createElement("video");
  // 상대방도 stream을 보내오면 해당 stream을 자신의 stream에 추가
  call.on("stream", (newUserVideoStream) => {
    addVideoSteram(newUserVideo, newUserVideoStream);
  });
  // call이 close 되면 삭제
  call.on("close", () => newUserVideo.remove());

  joinedPeers[userID] = call; // 참여한 user의 call을 저장
}
