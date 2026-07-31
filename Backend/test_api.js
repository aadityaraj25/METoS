async function test() {
    try {
        const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'aaditya@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.log("Login failed", loginData);
            return;
        }
        const token = loginData.data.accessToken;

        const usersRes = await fetch('http://localhost:8000/api/v1/users/search', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        const targetUserId = usersData.data.users[0]._id;

        console.log("Sending request to:", targetUserId);

        const reqRes = await fetch(`http://localhost:8000/api/v1/connections/request/${targetUserId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        const reqData = await reqRes.json();
        console.log("Success:", reqData);
    } catch (err) {
        console.error("Error:", err.message);
    }
}
test();
