const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("YOUR_MONGO_DB_URI");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const messageSchema = new mongoose.Schema({
  user: String, 
  text: String,
  replies: [{ user: String, text: String }],
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);


app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: "Missing fields" });
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ msg: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  await new User({ username, password: hash }).save();
  res.json({ msg: "Registered" });
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: "Missing fields" });

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid credentials" });

  res.json({ username });
});


app.get("/messages", async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});


app.post("/messages", async (req, res) => {
  const { user, text } = req.body;
  if (!user || !text)
    return res.status(400).json({ msg: "Missing user or text" });

  const message = new Message({ user, text, replies: [] });
  await message.save();
  res.json(message);
});


app.post("/messages/:id/reply", async (req, res) => {
  const { user, text } = req.body;
  if (!user || !text)
    return res.status(400).json({ msg: "Missing user or text" });

  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ msg: "Message not found" });

  message.replies.push({ user, text });
  await message.save();
  res.json(message);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
