import { io } from "socket.io-client";

async function runTest() {
  const backend = "http://localhost:8000/api/v1";

  // 1. User A (Leader)
  const userA = { fullName: "Leader A", email: `leadera_${Date.now()}@test.com`, username: `leadera_${Date.now()}`, password: "password123" };
  await fetch(`${backend}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userA) });
  
  let resA = await fetch(`${backend}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userA.email, password: userA.password }) });
  let dataA = await resA.json();
  const tokenA = dataA.data?.accessToken;
  const idA = dataA.data?.user?._id;

  // 2. User A creates a group
  const groupData = { teamName: "Test Group", description: "Test", technologies: ["React"], teamSize: 5 };
  let groupRes = await fetch(`${backend}/groups`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenA}` }, body: JSON.stringify(groupData) });
  let groupDataRes = await groupRes.json();
  const groupId = groupDataRes.data?._id;
  console.log("Group created:", groupId);

  // 3. User B (Requester)
  const userB = { fullName: "User B", email: `userb_${Date.now()}@test.com`, username: `userb_${Date.now()}`, password: "password123" };
  await fetch(`${backend}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userB) });
  
  let resB = await fetch(`${backend}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userB.email, password: userB.password }) });
  let dataB = await resB.json();
  const tokenB = dataB.data?.accessToken;
  const idB = dataB.data?.user?._id;

  if (!tokenA || !tokenB || !groupId) {
    console.error("Setup failed");
    return;
  }

  // 4. Connect User A to Socket
  const socketA = io("http://localhost:8000", { query: { userId: idA } });

  socketA.on("connect", () => {
    console.log("Leader A socket connected:", socketA.id);

    setTimeout(async () => {
      console.log("User B sending join request to Group", groupId);
      const reqRes = await fetch(`${backend}/join-requests/${groupId}`, {
        method: "POST", headers: { "Authorization": `Bearer ${tokenB}` }
      });
      const reqData = await reqRes.json();
      console.log("Join request success:", reqData.success);
    }, 1000);
  });

  socketA.on("new_notification", (data) => {
    console.log("SUCCESS! Leader A received socket notification:", data);
    socketA.close();
    process.exit(0);
  });

  socketA.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
    process.exit(1);
  });
  
  setTimeout(() => {
    console.error("Test timed out.");
    process.exit(1);
  }, 5000);
}

runTest();
