import { useState } from "react";
import { api } from "../api/client";
import MvdtLogo from "../assets/mvdt_logo.png";

function Reply({ reply, onChoice }) {
  return (
    <div className="bubble bot">
      <div className="message-text">{reply.body}</div>
      {reply.choices?.map((choice) => (
        <button
          className="choice"
          key={choice.id}
          onClick={() => onChoice(choice)}
        >
          <b>{choice.title}</b>
          {choice.description && <small>{choice.description}</small>}
        </button>
      ))}
      {reply.rows?.map((row) => (
        <button className="choice" key={row.id} onClick={() => onChoice(row)}>
          <b>{row.title}</b>
          {row.description && <small>{row.description}</small>}
        </button>
      ))}
    </div>
  );
}

export default function Simulator() {
  const [phone, setPhone] = useState("919876543210");
  const [input, setInput] = useState("hii");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(payload, label) {
    setLoading(true);
    setError("");
    setMessages((old) => [...old, { user: true, body: label }]);
    try {
      const { data } = await api.post("/simulator/message", {
        phone,
        ...payload,
      });
      setMessages((old) => [...old, ...data.replies]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not connect to the backend",
      );
    } finally {
      setLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    if (!input.trim()) return;
    const value = input.trim();
    setInput("");
    send({ text: value }, value);
  }

  function choose(choice) {
    if (choice.id === "invoice_yes" || choice.id === "invoice_no") {
      send({ interactiveId: choice.id }, choice.title);
      return;
    }
    send({ interactiveId: choice.id }, choice.title);
  }

  function attachEvidence() {
    send(
      { mediaId: `simulated-media-${Date.now()}`, text: "" },
      "📎 Evidence photo attached",
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>WhatsApp Flow Simulator</h1>
          <p>
            Uses the real backend conversation engine without sending Meta
            messages.
          </p>
        </div>
        <label className="phone-field">
          Test phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </div>
      <div className="phone-shell">
        <header>
          {/* <span className="avatar">M</span> */}
            <img src={MvdtLogo} alt="" className="avatar"/>
          <div>
            <strong>MVDT Field Assistant</strong>
            <small>Business account</small>
          </div>
        </header>
        <main className="chat-body">
          {!messages.length && (
            <div className="empty-chat">
              Send <b>hii</b> to begin with the seeded user.
            </div>
          )}
          {messages.map((message, index) =>
            message.user ? (
              <div className="bubble user" key={index}>
                {message.body}
              </div>
            ) : (
              <Reply reply={message} onChoice={choose} key={index} />
            ),
          )}
          {error && <div className="error">{error}</div>}
        </main>
        <form className="composer" onSubmit={submit}>
          <button
            type="button"
            title="Simulate image evidence"
            onClick={attachEvidence}
          >
            📎
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
          />
          <button className="send" disabled={loading}>
            {loading ? "…" : "➤"}
          </button>
        </form>
      </div>
    </section>
  );
}
