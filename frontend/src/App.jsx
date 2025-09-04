import { useState } from "react";
import { useEffect } from "react";
import axios from 'axios';
import "./App.css";

const api = axios.create({ baseURL: 'http://localhost:5000' });
export default function App() {
  const [page, setPage] = useState("login"); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    if (loggedInUser) {
      fetchMessages();
      setPage("forum");
    }
  }, [loggedInUser]);

  const fetchMessages = async () => {
    const res = await api.get("/messages");
    setMessages(res.data);
  };

  const login = async () => {
    try {
      const res = await api.post("/login", { username, password });
      setLoggedInUser(res.data.username);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  const register = async () => {
    try {
      await api.post("/register", { username, password });
      alert("Registered! Please login.");
      setPage("login");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  const postMessage = async () => {
    if (!newMsg) return;
    const res = await api.post("/messages", {
      user: loggedInUser,
      text: newMsg,
    });
    setMessages([res.data, ...messages]);
    setNewMsg("");
  };

  const postReply = async (id) => {
    if (!replyText) return;
    const res = await api.post(`/messages/${id}/reply`, {
      user: loggedInUser,
      text: replyText,
    });
    setMessages(messages.map((m) => (m._id === res.data._id ? res.data : m)));
    setReplyText("");
    setReplyTo(null);
  };

  if (page === "login") {
    return (
      <div>
        <h2>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
        <p>
          Don't have an account?{" "}
          <button onClick={() => setPage("register")}>Register</button>
        </p>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div>
        <h2>Register</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={register}>Register</button>
        <p>
          Already have an account?{" "}
          <button onClick={() => setPage("login")}>Login</button>
        </p>
      </div>
    );
  }

  if (page === "forum") {
    return (
      <div>
        <h2>Community Forum</h2>
        <p>
          Logged in as: <b>{loggedInUser}</b>
        </p>
        <button
          onClick={() => {
            setLoggedInUser(null);
            setPage("login");
          }}
        >
          Logout
        </button>

        <div>
          <textarea
            placeholder="Write a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
          />
          <br />
          <button onClick={postMessage}>Post Message</button>
        </div>

        {messages.map((m) => (
          <div
            key={m._id}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
            }}
          >
            <b>{m.user}</b>: {m.text}
            <div>
              {m.replies.map((r, i) => (
                <div key={i} style={{ marginLeft: "20px" }}>
                  <i>{r.user}</i>: {r.text}
                </div>
              ))}
            </div>
            {replyTo === m._id ? (
              <div>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                />
                <button onClick={() => postReply(m._id)}>Send Reply</button>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setReplyTo(m._id)}>Reply</button>
            )}
          </div>
        ))}
      </div>
    );
  }
}
