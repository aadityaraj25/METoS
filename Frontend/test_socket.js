import { io } from "socket.io-client";

async function runTest() {
  const backend = "http://localhost:8000/api/v1";

  // 1. Register and Login User A
  const userA = { fullName: "User A", email: `usera_${Date.now()}@test.com`, username: `usera_${Date.now()}`, password: "password123" };
  await fetch(`${backend}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userA) });
  
  let resA = await fetch(`${backend}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userA.email, password: userA.password }) });
  let dataA = await resA.json();
  const tokenA = dataA.data?.accessToken;
  const idA = dataA.data?.user?._id;

  // 2. Register and Login User B
  const userB = { fullName: "User B", email: `userb_${Date.now()}@test.com`, username: `userb_${Date.now()}`, password: "password123" };
  await fetch(`${backend}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userB) });
  
  let resB = await fetch(`${backend}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userB.email, password: userB.password }) });
  let dataB = await resB.json();
  const tokenB = dataB.data?.accessToken;
  const idB = dataB.data?.user?._id;

  if (!tokenA || !tokenB) {
    console.error("Failed to login");
    return;
  }

  console.log(`Logged in User A (${idA}) and User B (${idB})`);

  // 3. Connect User B to Socket
  const socketB = io("http://localhost:8000", { query: { userId: idB } });

  socketB.on("connect", () => {
    console.log("User B socket connected:", socketB.id);

    setTimeout(async () => {
      console.log("User A sending request to User B...");
      const reqRes = await fetch(`${backend}/connections/request/${idB}`, {
        method: "POST", headers: { "Authorization": `Bearer ${tokenA}` }
      });
      const reqData = await reqRes.json();
      console.log("Send request success:", reqData.success);
    }, 1000);
  });

  socketB.on("new_notification", (data) => {
    console.log("SUCCESS! User B received socket notification:", data);
    socketB.close();
    process.exit(0);
  });

  socketB.on("connect_error", (err) => {
    console.error("Socket B connection error:", err.message);
    process.exit(1);
  });
  
  setTimeout(() => {
    console.error("Test timed out.");
    process.exit(1);
  }, 5000);
}

runTest();
