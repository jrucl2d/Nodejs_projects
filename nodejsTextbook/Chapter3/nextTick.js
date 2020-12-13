setImmediate(() => {
  console.log("immediate");
});
process.nextTick(() => {
  // setImmediate이나 setTimeout보다 더 빠르게 실행됨
  console.log("nextTick");
});
setTimeout(() => {
  console.log("timeout");
}, 0);
Promise.resolve().then(() => console.log("promise")); // resolve된 promise도 nextTick처럼 다른 콜백들보다 우선시 됨

// nextTick과 promise를 '마이크로태스크'라고 따로 부른다.
