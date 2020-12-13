setInterval(() => {
  console.log("start");
  try {
    throw new Error(`I'll destroy this server!`); // 에러가 계속 발생하지만 try catch 문으로 잡아서 계속 프로그램이 진행됨
  } catch (err) {
    console.error(err);
  }
}, 1000);
