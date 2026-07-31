import mongoose from 'mongoose';
mongoose.connect('mongodb+srv://aaditya25:minionWorld@cluster1.ylixccp.mongodb.net/METoS');
mongoose.connection.on('connected', async () => {
  const users = mongoose.connection.collection('users');
  const user = await users.findOne({ username: 'testuser2' });
  console.log(user);
  process.exit(0);
});
