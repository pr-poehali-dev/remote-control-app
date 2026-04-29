import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { mockChats, mockMessages, mockUsers, type Message, type Chat } from "@/data/messenger";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🚀", "✅", "🙏", "💯"];
const FORMAT_TAGS = [
  { label: "B", title: "Жирный", wrap: "**" },
  { label: "I", title: "Курсив", wrap: "_" },
  { label: "M", title: "Моно", wrap: "`" },
];

function UserAvatar({ id, size = 36 }: { id: string; size?: number }) {
  const u = mockUsers.find(u => u.id === id);
  if (!u) return <div style={{ width: size, height: size }} className="rounded-xl bg-white/10 flex items-center justify-center text-xs text-white/50">{id[0].toUpperCase()}</div>;
  const colors = ["from-cyan-500/40 to-blue-500/40", "from-violet-500/40 to-pink-500/40", "from-emerald-500/40 to-teal-500/40", "from-orange-500/40 to-amber-500/40"];
  const ci = mockUsers.indexOf(u) % colors.length;
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.38 }} className={`rounded-xl bg-gradient-to-br ${colors[ci]} flex items-center justify-center font-bold text-white shrink-0 relative`}>
      {u.avatar}
      {u.status === "online" && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0e1e]" />}
    </div>
  );
}

function MessageBubble({ msg, onReact, onReply, isOwn, replyMsg }: {
  msg: Message; onReact: (id: string, emoji: string) => void;
  onReply: (msg: Message) => void; isOwn: boolean; replyMsg?: Message;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const user = mockUsers.find(u => u.id === msg.from);

  const renderContent = () => {
    if (msg.type === "voice") return (
      <div className="flex items-center gap-3 min-w-48">
        <button className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
          <Icon name="Play" size={14} className="text-cyan-400" />
        </button>
        <div className="flex-1">
          <div className="flex gap-px">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="w-1 rounded-full bg-cyan-500/40" style={{ height: `${8 + Math.sin(i * 0.8 + 1) * 6 + Math.random() * 4}px` }} />
            ))}
          </div>
          <div className="text-xs text-white/30 mt-1 font-mono-custom">{msg.duration}</div>
        </div>
      </div>
    );
    if (msg.type === "document") return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Icon name="FileText" size={18} className="text-violet-400" />
        </div>
        <div>
          <div className="text-sm text-white/90 font-medium">{msg.fileName}</div>
          <div className="text-xs text-white/35 font-mono-custom">{msg.fileSize}</div>
        </div>
        <button className="ml-2 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
          <Icon name="Download" size={14} className="text-white/50" />
        </button>
      </div>
    );
    if (msg.type === "image") return (
      <div className="rounded-xl overflow-hidden" style={{ width: 220, height: 140, background: "linear-gradient(135deg, rgba(0,229,255,0.1), rgba(168,85,247,0.1))" }}>
        <div className="w-full h-full flex items-center justify-center">
          <Icon name="Image" size={32} className="text-white/20" />
        </div>
      </div>
    );
    return <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{msg.text}</p>;
  };

  return (
    <div className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && <UserAvatar id={msg.from} size={32} />}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        {!isOwn && <span className="text-xs text-white/30 px-1 font-mono-custom">{user?.name}</span>}

        {replyMsg && (
          <div className={`px-3 py-1.5 rounded-xl mb-0.5 border-l-2 border-cyan-500 bg-cyan-500/5 text-xs text-white/40 max-w-xs`}>
            <span className="text-cyan-400 font-medium">{mockUsers.find(u => u.id === replyMsg.from)?.name}</span>
            <p className="truncate">{replyMsg.type === "voice" ? "🎤 Голосовое" : replyMsg.type === "document" ? "📎 " + replyMsg.fileName : replyMsg.text}</p>
          </div>
        )}

        <div className={`relative px-3.5 py-2.5 rounded-2xl ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}
          style={{ background: isOwn ? "linear-gradient(135deg, rgba(0,229,255,0.18), rgba(168,85,247,0.12))" : "rgba(255,255,255,0.05)", border: isOwn ? "1px solid rgba(0,229,255,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>

          {renderContent()}

          {msg.type === "voice" && msg.transcript && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-white/40 italic">📝 {msg.transcript}</p>
            </div>
          )}

          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-white/20 font-mono-custom">{msg.time}</span>
            {msg.edited && <span className="text-xs text-white/20">· ред.</span>}
            {isOwn && <Icon name={msg.seen ? "CheckCheck" : "Check"} size={11} className={msg.seen ? "text-cyan-400" : "text-white/25"} />}
          </div>

          {/* Hover actions */}
          <div className={`absolute ${isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} top-1 hidden group-hover:flex items-center gap-1`}>
            <button onClick={() => setShowReactions(r => !r)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center">
              <Icon name="SmilePlus" size={13} className="text-white/60" />
            </button>
            <button onClick={() => onReply(msg)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center">
              <Icon name="CornerUpLeft" size={13} className="text-white/60" />
            </button>
          </div>

          {showReactions && (
            <div className={`absolute ${isOwn ? "right-0" : "left-0"} bottom-full mb-1 flex gap-1 p-1.5 rounded-2xl z-10`}
              style={{ background: "rgba(20,25,50,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { onReact(msg.id, e); setShowReactions(false); }}
                  className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-lg transition-colors">
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {msg.reactions.map((r, i) => (
              <button key={i} onClick={() => onReact(msg.id, r.emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono-custom"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {r.emoji} <span className="text-white/50">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CallModal({ type, chat, onClose }: { type: "audio" | "video"; chat: Chat; onClose: () => void }) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const members = chat.members.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="rounded-3xl p-8 text-center w-80" style={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="text-white/40 text-sm mb-2">{type === "video" ? "Видеозвонок" : "Голосовой звонок"}</div>
        <div className="text-white font-bold text-xl mb-1">{chat.name}</div>
        <div className="text-cyan-400 font-mono-custom text-sm mb-6">{fmt(elapsed)}</div>

        {type === "video" && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {members.map(id => (
              <div key={id} className="aspect-video rounded-xl flex items-center justify-center" style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <UserAvatar id={id} size={40} />
              </div>
            ))}
          </div>
        )}

        {type === "audio" && (
          <div className="flex justify-center gap-3 mb-6">
            {members.map(id => <UserAvatar key={id} id={id} size={52} />)}
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button onClick={() => setMuted(m => !m)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${muted ? "bg-rose-500/30" : "bg-white/10"}`}>
            <Icon name={muted ? "MicOff" : "Mic"} size={20} className={muted ? "text-rose-400" : "text-white/70"} />
          </button>
          {type === "video" && (
            <button onClick={() => setVideoOff(v => !v)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${videoOff ? "bg-rose-500/30" : "bg-white/10"}`}>
              <Icon name={videoOff ? "VideoOff" : "Video"} size={20} className={videoOff ? "text-rose-400" : "text-white/70"} />
            </button>
          )}
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center">
            <Icon name="PhoneOff" size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MessengerSection() {
  const [chats, setChats] = useState(mockChats);
  const [messages, setMessages] = useState(mockMessages);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [call, setCall] = useState<{ type: "audio" | "video"; chat: Chat } | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [tab, setTab] = useState<"chats" | "contacts" | "calls">("chats");
  const [searchChat, setSearchChat] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ME = "admin";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, messages]);

  const activeMsgs = activeChat ? (messages[activeChat.id] || []) : [];

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      from: ME,
      text: input.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
      reactions: [],
      replyTo: replyTo?.id,
      seen: false,
    };
    setMessages(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), msg] }));
    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: input.trim(), lastTime: msg.time, unread: 0 } : c));
    setInput("");
    setReplyTo(null);
  };

  const handleReact = (chatId: string, msgId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map(m => {
        if (m.id !== msgId) return m;
        const existing = m.reactions.find(r => r.emoji === emoji);
        if (existing) {
          const users = existing.users.includes(ME) ? existing.users.filter(u => u !== ME) : [...existing.users, ME];
          const reactions = users.length === 0 ? m.reactions.filter(r => r.emoji !== emoji) : m.reactions.map(r => r.emoji === emoji ? { ...r, users } : r);
          return { ...m, reactions };
        }
        return { ...m, reactions: [...m.reactions, { emoji, users: [ME] }] };
      }),
    }));
  };

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchChat.toLowerCase()));
  const directUser = activeChat?.type === "direct" ? mockUsers.find(u => u.id === activeChat.members.find(m => m !== ME)) : null;

  return (
    <div className="animate-fade-in h-[calc(100vh-140px)] flex gap-4">
      {call && <CallModal type={call.type} chat={call.chat} onClose={() => setCall(null)} />}

      {/* Left sidebar */}
      <div className="w-72 glass-card flex flex-col shrink-0">
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {[
            { id: "chats" as const, icon: "MessageSquare", label: "Чаты" },
            { id: "contacts" as const, icon: "Users", label: "Контакты" },
            { id: "calls" as const, icon: "Phone", label: "Звонки" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-all ${tab === t.id ? "text-cyan-400 border-b-2 border-cyan-400" : "text-white/30 hover:text-white/60"}`}>
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={searchChat} onChange={e => setSearchChat(e.target.value)} placeholder="Поиск..." className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-xs text-white/70 outline-none font-mono-custom placeholder:text-white/20" />
          </div>
        </div>

        {/* Chats list */}
        {tab === "chats" && (
          <div className="flex-1 overflow-y-auto space-y-0 divide-y divide-white/5">
            {filteredChats.map(chat => (
              <button key={chat.id} onClick={() => { setActiveChat(chat); setShowUserInfo(false); }}
                className={`w-full text-left p-3 hover:bg-white/[0.03] transition-colors flex items-center gap-3 ${activeChat?.id === chat.id ? "bg-cyan-500/5" : ""}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl shrink-0 relative">
                  {chat.type === "group" ? chat.avatar : (
                    <UserAvatar id={chat.members.find(m => m !== ME) || ""} size={40} />
                  )}
                  {chat.pinned && <span className="absolute -top-1 -right-1 text-xs">📌</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/90 truncate">{chat.name}</span>
                    <span className="text-xs text-white/25 font-mono-custom shrink-0">{chat.lastTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/35 truncate">{chat.muted ? "🔇 " : ""}{chat.lastMessage}</span>
                    {chat.unread > 0 && <span className="ml-1 shrink-0 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-xs text-black font-bold">{chat.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "contacts" && (
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {mockUsers.filter(u => u.id !== ME).map(u => (
              <button key={u.id} onClick={() => {
                const dm = chats.find(c => c.type === "direct" && c.members.includes(u.id) && c.members.includes(ME));
                if (dm) setActiveChat(dm);
              }} className="w-full text-left p-3 hover:bg-white/[0.03] transition-colors flex items-center gap-3">
                <UserAvatar id={u.id} size={36} />
                <div>
                  <div className="text-sm font-semibold text-white/90">{u.name}</div>
                  <div className="text-xs text-white/35">{u.role}</div>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs font-mono-custom ${u.status === "online" ? "text-emerald-400" : u.status === "idle" ? "text-cyan-400" : "text-gray-500"}`}>
                    {u.status === "online" ? "●" : "○"} {u.lastSeen}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "calls" && (
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {[
              { user: "developer", type: "incoming", time: "14:30", duration: "3:42" },
              { user: "security", type: "outgoing", time: "11:15", duration: "12:08" },
              { user: "manager", type: "missed", time: "09:00", duration: "" },
              { user: "analyst", type: "outgoing", time: "Вчера", duration: "5:30" },
            ].map((c, i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                <UserAvatar id={c.user} size={36} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/90">{mockUsers.find(u => u.id === c.user)?.name}</div>
                  <div className="flex items-center gap-1">
                    <Icon name={c.type === "missed" ? "PhoneMissed" : c.type === "incoming" ? "PhoneIncoming" : "PhoneOutgoing"} size={12}
                      className={c.type === "missed" ? "text-rose-400" : "text-emerald-400"} />
                    <span className="text-xs text-white/35 font-mono-custom">{c.time}{c.duration ? ` · ${c.duration}` : ""}</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                  <Icon name="Phone" size={14} className="text-emerald-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      {activeChat ? (
        <div className="flex-1 glass-card flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg">
              {activeChat.type === "group" ? activeChat.avatar : <UserAvatar id={activeChat.members.find(m => m !== ME) || ""} size={36} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white/90 text-sm">{activeChat.name}</div>
              <div className="text-xs text-white/35 font-mono-custom">
                {activeChat.type === "group"
                  ? `${activeChat.members.length} участников · ${activeChat.privacyLevel === "private" ? "🔒 Закрытая" : activeChat.privacyLevel === "closed" ? "Закрытая" : "Открытая"}`
                  : (directUser?.status === "online" ? "🟢 В сети" : `Был(а) ${directUser?.lastSeen}`)
                }
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => activeChat && setCall({ type: "audio", chat: activeChat })}
                className="w-9 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                <Icon name="Phone" size={16} className="text-emerald-400" />
              </button>
              <button onClick={() => activeChat && setCall({ type: "video", chat: activeChat })}
                className="w-9 h-9 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                <Icon name="Video" size={16} className="text-cyan-400" />
              </button>
              <button onClick={() => setShowUserInfo(v => !v)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showUserInfo ? "bg-violet-500/20" : "bg-white/5 hover:bg-white/10"}`}>
                <Icon name="Info" size={16} className={showUserInfo ? "text-violet-400" : "text-white/40"} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Pinned */}
                {activeChat.pinnedMessages && activeChat.pinnedMessages.length > 0 && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl mb-2" style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.1)" }}>
                    <Icon name="Pin" size={13} className="text-cyan-400 shrink-0" />
                    <span className="text-xs text-cyan-400/70 font-mono-custom">Закреплённое сообщение</span>
                  </div>
                )}

                {activeMsgs.map(msg => {
                  const reply = msg.replyTo ? activeMsgs.find(m => m.id === msg.replyTo) : undefined;
                  return (
                    <MessageBubble key={msg.id} msg={msg} isOwn={msg.from === ME}
                      replyMsg={reply}
                      onReact={(id, emoji) => handleReact(activeChat.id, id, emoji)}
                      onReply={m => setReplyTo(m)} />
                  );
                })}
                {activeMsgs.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-20 text-center">
                    <div>
                      <div className="text-4xl mb-3">💬</div>
                      <p className="text-white/25 text-sm">Нет сообщений</p>
                      <p className="text-white/15 text-xs mt-1">Начните диалог</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply bar */}
              {replyTo && (
                <div className="mx-4 mb-2 flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)" }}>
                  <Icon name="CornerUpLeft" size={13} className="text-cyan-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-cyan-400 font-mono-custom">{mockUsers.find(u => u.id === replyTo.from)?.name}</div>
                    <p className="text-xs text-white/40 truncate">{replyTo.type === "voice" ? "🎤 Голосовое" : replyTo.text}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)}><Icon name="X" size={13} className="text-white/40 hover:text-white/70" /></button>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  {FORMAT_TAGS.map(f => (
                    <button key={f.label} title={f.title} onClick={() => setInput(v => v + f.wrap)}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-mono-custom text-white/40 hover:text-white/70 transition-all">{f.label}</button>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex gap-1">
                    <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                      <Icon name="Paperclip" size={15} className="text-white/40" />
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                      <Icon name="ImagePlus" size={15} className="text-white/40" />
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                      <Icon name="Mic" size={15} className="text-white/40" />
                    </button>
                  </div>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Написать сообщение..."
                    rows={1}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/85 outline-none resize-none focus:border-cyan-500/30 placeholder:text-white/20"
                    style={{ minHeight: 40, maxHeight: 120 }}
                  />
                  <button onClick={sendMessage} disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: input.trim() ? "linear-gradient(135deg,#00e5ff,#a855f7)" : "rgba(255,255,255,0.05)" }}>
                    <Icon name="Send" size={16} className={input.trim() ? "text-black" : "text-white/40"} />
                  </button>
                </div>
              </div>
            </div>

            {/* Info panel */}
            {showUserInfo && (
              <div className="w-64 border-l border-white/5 p-4 overflow-y-auto shrink-0 space-y-4">
                <div className="text-center">
                  {activeChat.type === "group" ? (
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-3xl mb-2">{activeChat.avatar}</div>
                  ) : (
                    <div className="flex justify-center mb-2"><UserAvatar id={directUser?.id || ""} size={64} /></div>
                  )}
                  <div className="font-bold text-white/90">{activeChat.name}</div>
                  {activeChat.description && <p className="text-xs text-white/35 mt-1">{activeChat.description}</p>}
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Icon name="Lock" size={11} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400">Сквозное шифрование</span>
                  </div>
                </div>

                {activeChat.type === "group" && (
                  <div>
                    <div className="text-xs text-white/35 mb-2">Участники ({activeChat.members.length})</div>
                    <div className="space-y-2">
                      {activeChat.members.map(id => {
                        const u = mockUsers.find(u => u.id === id);
                        return u ? (
                          <div key={id} className="flex items-center gap-2">
                            <UserAvatar id={id} size={28} />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-white/80 truncate">{u.name}</div>
                            </div>
                            {activeChat.admins?.includes(id) && <span className="text-xs text-amber-400 font-mono-custom">Адм</span>}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-white/35 mb-1">Настройки</div>
                  {[
                    { icon: "BellOff", label: "Не беспокоить" },
                    { icon: "Pin", label: "Закреплённые" },
                    { icon: "Search", label: "Поиск в чате" },
                    { icon: "Shield", label: "Безопасность" },
                    { icon: "Ban", label: "Заблокировать" },
                  ].map(item => (
                    <button key={item.label} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 hover:bg-white/6 text-xs text-white/55 transition-colors">
                      <Icon name={item.icon} size={13} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 glass-card flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="font-bold text-white/60 text-lg">Выберите чат</h3>
          <p className="text-white/25 text-sm mt-1">или начните новый разговор</p>
        </div>
      )}
    </div>
  );
}
