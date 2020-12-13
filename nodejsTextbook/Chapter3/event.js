const eventEmitter = require("events");

const myEvent = new eventEmitter();

myEvent.addListener("event1", () => {
  console.log("event1"); // on과 같은 기능
});
myEvent.on("event2", () => {
  console.log("event2"); // on(이벤트명, 콜백). 이벤트 이름과 발생시 콜백을 연결해주는 동작을 '이벤트 리스닝'이라고 한다.
});
myEvent.on("event2", () => {
  console.log("event2 added"); // 이벤트 하나에 여러 개를 달아줄 수 있다.
});

myEvent.emit("event1"); // 이벤트를 호출한다. 이벤트 이름을 인자로 넣어주면 콜백함수가 실행됨.
myEvent.emit("event2");

myEvent.once("event3", () => {
  console.log("event3"); // 한 번만 실행된다. 두 번 호출해도 한 번만 실행됨.
});
myEvent.emit("event3");
myEvent.emit("event3");

myEvent.on("event4", () => {
  console.log("event4");
});
myEvent.removeAllListeners("event4"); // 모든 이벤트 리스너 삭제함
myEvent.emit("event4"); // 이전에 삭제했으므로 event4는 호출되지 않음

const listener = () => {
  console.log("event5");
};
myEvent.on("event5", listener);
myEvent.removeListener("event5", listener); // 연결된 이벤트 리스너를 하나씩 제거
myEvent.emit("event5");

// myEvent.removeAllListeners("event2"); // 이거 추가시 아래 결과는 0
console.log(myEvent.listenerCount("event2")); // 현재 연결된 리스너 개수 출력
