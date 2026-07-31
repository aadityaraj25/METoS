import { io } from "socket.io-client";

async function runTest() {
  const backend = "http://localhost:8000/api/v1";

  const userA = { fullName: "Leader A", email: `leadera_${Date.now()}@test.com`, username: `leadera_${Date.now()}`, password: "password123" };
  await fetch(`${backend}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userA) });
  
  let resA = await fetch(`${backend}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userA.email, password: userA.password }) });
  let dataA = await resA.json();
  const tokenA = dataA.data?.accessToken;

  const groupData = { teamName: "Test Group", description: "Test", technologies: ["React"], teamSize: 5 };
  let groupRes = await fetch(`${backend}/groups`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenA}` }, body: JSON.stringify(groupData) });
  let groupDataRes = await groupRes.json();
  console.log("Group creation response:", groupDataRes);
}
runTest();
