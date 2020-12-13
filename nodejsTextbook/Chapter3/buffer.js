const buffer = Buffer.from("이것은 버퍼가 될 것"); // 문자열 to Buffer
console.log(buffer);
console.log(buffer.length); // Byte 단위 버퍼의 크기
console.log(buffer.toString()); // base64나 hex를 인자로 넣으면 해당 인코딩으로 변환 가능

const array = [
  Buffer.from("띄엄 "),
  Buffer.from("띄엄 "),
  Buffer.from("띄어쓰기"),
];
const buffer2 = Buffer.concat(array); // 배열에 들어있는 버퍼들을 하나로 합침
console.log(buffer2.toString());

const buffer3 = Buffer.alloc(5); // 빈 버퍼를 생성. 바이트를 인자로 지정해주면 해당 크기의 버퍼가 생성됨.
console.log(buffer3);
