const userlist = document.querySelector("#userlist");
window.onload = getUser();
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = e.target.username.value;
  e.target.username.value = "";
  if (!name) {
    alert("이름을 입력하세요!");
    return;
  }
  try {
    await axios.post("/user", { name });
    getUser();
  } catch (err) {
    console.error(err);
  }
});
async function getUser() {
  try {
    const result = await axios.get("/user");
    const users = result.data;
    userlist.innerHTML = "";
    Object.keys(users).map((id) => {
      //   console.log(users[id]);
      const person = document.createElement("div");
      const innerName = document.createElement("span");
      innerName.textContent = users[id];
      const updateBtn = document.createElement("button");
      updateBtn.className = "updateBtm";
      updateBtn.textContent = "변경";
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "deleteBtn";
      deleteBtn.textContent = "삭제";
      updateBtn.addEventListener("click", async () => {
        const newName = prompt("바꿀 이름 입력");
        if (!newName) {
          return alert("반드시 입력하세요!");
        }
        try {
          await axios.put(`/user/${id}`, { newName });
          getUser();
        } catch (err) {
          console.error(err);
        }
      });
      deleteBtn.addEventListener("click", async () => {
        try {
          await axios.delete(`/user/${id}`);
          getUser();
        } catch (err) {
          console.error(err);
        }
      });
      person.appendChild(innerName);
      person.appendChild(updateBtn);
      person.appendChild(deleteBtn);
      userlist.appendChild(person);
    });
  } catch (err) {
    console.error(err);
  }
}
