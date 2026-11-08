import { useMemo, useState } from "react";
import { Search, Pencil, MoreHorizontal, Paperclip, Smile, Mic, Send, CheckCheck, Phone, Video, Info, MessageCircle, Users, Settings, Archive, Image, FileText, Plus, ChevronDown } from "lucide-react";

type Chat = { id: number; name: string; message: string; time: string; unread?: number; online?: boolean; avatar: string; color: string; pinned?: boolean };
const initialChats: Chat[] = [
  { id: 1, name: "NEXCHAT Team", message: "Welcome to the new space 👋", time: "12:42", unread: 2, online: true, avatar: "N", color: "#4c8bf5", pinned: true },
  { id: 2, name: "Alex Morgan", message: "That sounds great!", time: "11:58", online: true, avatar: "A", color: "#d18b62" },
  { id: 3, name: "Design Community", message: "Maya: shared a new concept", time: "10:24", unread: 4, avatar: "D", color: "#8c72d9", pinned: true },
  { id: 4, name: "Sam Wilson", message: "📷 Photo", time: "Yesterday", avatar: "S", color: "#4c9b82" },
  { id: 5, name: "Product Updates", message: "NEXCHAT 0.1.0 is taking shape", time: "Yesterday", avatar: "P", color: "#c17b9d" },
  { id: 6, name: "Jamie Chen", message: "See you tomorrow!", time: "Mon", avatar: "J", color: "#c49b4b" }
];
const starterMessages = [
  { id: 1, mine: false, text: "Hey! Welcome to NEXCHAT.", time: "12:39" },
  { id: 2, mine: false, text: "A fresh place for conversations. What do you think?", time: "12:40" },
  { id: 3, mine: true, text: "The interface is looking clean ✨", time: "12:41" },
  { id: 4, mine: false, text: "We're just getting started. More features are on the way!", time: "12:42" }
];

export default function App() {
  const [chats, setChats] = useState(initialChats);
  const [active, setActive] = useState(1);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Record<number, typeof starterMessages>>({ 1: starterMessages });
  const [tab, setTab] = useState("All chats");
  const [showInfo, setShowInfo] = useState(false);
  const current = chats.find((chat) => chat.id === active) ?? chats[0];
  const visibleChats = useMemo(() => chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase()) && (tab !== "Unread" || chat.unread)), [chats, query, tab]);
  const currentMessages = messages[active] ?? starterMessages;

  function sendMessage() {
    const text = message.trim();
    if (!text) return;
    const next = [...currentMessages, { id: Date.now(), mine: true, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
    setMessages((all) => ({ ...all, [active]: next }));
    setChats((all) => all.map((chat) => chat.id === active ? { ...chat, message: text, time: "now" } : chat));
    setMessage("");
  }

  return <main className="shell">
    <aside className="rail">
      <div className="brand-mark">n</div>
      <button className="rail-button active" title="Chats"><MessageCircle size={21}/></button>
      <button className="rail-button" title="Contacts"><Users size={21}/></button>
      <button className="rail-button" title="Archived"><Archive size={21}/></button>
      <div className="rail-spacer"/>
      <button className="rail-button" title="Settings"><Settings size={21}/></button>
      <div className="my-avatar">R</div>
    </aside>

    <section className="sidebar">
      <header className="sidebar-header">
        <div><div className="eyebrow">YOUR SPACE</div><h1>Messages <ChevronDown size={16}/></h1></div>
        <button className="icon-button compose" title="New message"><Pencil size={18}/></button>
      </header>
      <label className="search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages"/><kbd>⌘ K</kbd></label>
      <div className="tabs">{["All chats", "Unread"].map((name) => <button key={name} className={tab === name ? "tab selected" : "tab"} onClick={() => setTab(name)}>{name}</button>)}</div>
      <div className="chat-list">
        {visibleChats.map((chat) => <button key={chat.id} onClick={() => { setActive(chat.id); setShowInfo(false); }} className={active === chat.id ? "chat-row chosen" : "chat-row"}>
          <span className="avatar-wrap"><span className="avatar" style={{ background: chat.color }}>{chat.avatar}</span>{chat.online && <i className="online-dot"/>}</span>
          <span className="chat-copy"><span className="chat-top"><strong>{chat.name}</strong><time>{chat.time}</time></span><span className="chat-bottom"><span>{chat.message}</span>{chat.unread && <b className="unread">{chat.unread}</b>}</span></span>
        </button>)}
        {visibleChats.length === 0 && <div className="empty-search">No chats found</div>}
      </div>
      <button className="new-chat"><Plus size={18}/> New message</button>
      <div className="sidebar-foot"><span className="connection-dot"/> Preview workspace <span className="version">v0.1.0</span></div>
    </section>

    <section className="conversation">
      <header className="conversation-header">
        <div className="header-person"><span className="avatar small" style={{ background: current.color }}>{current.avatar}</span><div><strong>{current.name}</strong><span>{current.online ? "online" : "last seen recently"}</span></div></div>
        <div className="header-actions"><button className="icon-button" title="Voice call"><Phone size={19}/></button><button className="icon-button" title="Video call"><Video size={20}/></button><button className="icon-button" title="Search"><Search size={19}/></button><button className="icon-button" title="Chat info" onClick={() => setShowInfo(!showInfo)}><Info size={19}/></button><button className="icon-button" title="More"><MoreHorizontal size={21}/></button></div>
      </header>
      <div className="message-stage">
        <div className="date-chip">TODAY</div>
        {currentMessages.map((item) => <div key={item.id} className={item.mine ? "message-line mine" : "message-line"}><div className="bubble">{item.text}<span className="message-meta">{item.time} {item.mine && <CheckCheck size={14}/>}</span></div></div>)}
        <div className="encryption-note"><span>✦</span> This is a NEXCHAT preview. Messages are currently stored only in this browser session.</div>
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <button type="button" className="icon-button attach" title="Attach file"><Paperclip size={21}/></button>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message..." />
        <button type="button" className="icon-button" title="Emoji"><Smile size={21}/></button>
        {message.trim() ? <button className="send-button" type="submit" title="Send"><Send size={18}/></button> : <button type="button" className="icon-button" title="Voice message"><Mic size={21}/></button>}
      </form>
    </section>

    {showInfo && <aside className="info-panel"><div className="info-title">Chat details <button className="icon-button" onClick={() => setShowInfo(false)}>×</button></div><div className="info-avatar" style={{ background: current.color }}>{current.avatar}</div><h2>{current.name}</h2><p>{current.online ? "online" : "NEXCHAT member"}</p><div className="info-section"><span>SHARED MEDIA</span><div className="media-grid"><div><Image/></div><div><FileText/></div><div><Image/></div></div></div></aside>}
  </main>;
}
