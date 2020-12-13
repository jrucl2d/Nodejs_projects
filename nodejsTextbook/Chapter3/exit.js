let i = 1;
setInterval(() => {
  if (i === 5) {
    console.log("exit");
    process.exit();
  }
  console.log(i);
  i += 1;
}, 1000);
// 서버에서 사용하면 서버가 멈추므로 사용하지 않는다.
// 인자로 코드 번호를 줄 수 있다. 인자를 주지 않거나 0이면 정상 종료. 1이면 비정상 종료.actions
