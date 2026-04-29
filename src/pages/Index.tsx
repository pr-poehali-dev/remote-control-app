import { useState } from "react";
import Icon from "@/components/ui/icon";
import ConnectionsSection from "@/components/ConnectionsSection";
import MessengerSection from "@/components/MessengerSection";

// --- Types ---
type Section = "dashboard" | "connections" | "messenger" | "sessions" | "security" | "logs" | "users" | "analytics" | "settings";

// --- Mock Data ---
const activeSessions = [
  { id: "RC-001", user: "admin", ip: "192.168.1.45", location: "Москва, RU", os: "Windows 11", duration: "2ч 14м", status: "active", port: 3389, cpu: 34, bandwidth: "2.4 МБ/с" },
  { id: "RC-002", user: "developer", ip: "10.0.0.12", location: "СПб, RU", os: "Ubuntu 22.04", duration: "45м", status: "active", port: 22, cpu: 12, bandwidth: "0.8 МБ/с" },
  { id: "RC-003", user: "manager", ip: "78.25.190.11", location: "Екб, RU", os: "macOS 14", duration: "1ч 03м", status: "idle", port: 5900, cpu: 2, bandwidth: "0.1 МБ/с" },
];

const completedSessions = [
  { id: "RC-098", user: "admin", ip: "192.168.1.45", date: "30 апр, 14:22", duration: "3ч 10м", status: "closed", reason: "Завершён вручную" },
  { id: "RC-097", user: "support", ip: "212.44.18.99", date: "30 апр, 11:05", duration: "28м", status: "closed", reason: "Таймаут" },
  { id: "RC-096", user: "developer", ip: "10.0.0.12", date: "29 апр, 18:40", duration: "5ч 22м", status: "closed", reason: "Завершён вручную" },
  { id: "RC-095", user: "admin", ip: "178.96.12.44", date: "29 апр, 09:15", duration: "1ч 05м", status: "blocked", reason: "Блокировка безопасностью" },
];

const logEntries = [
  { time: "14:38:22", level: "INFO", event: "Новый сеанс RC-001", ip: "192.168.1.45", user: "admin" },
  { time: "14:35:11", level: "WARN", event: "Неудачная попытка входа (3/5)", ip: "91.108.4.12", user: "unknown" },
  { time: "14:32:05", level: "INFO", event: "Сеанс RC-002 возобновлён", ip: "10.0.0.12", user: "developer" },
  { time: "14:28:44", level: "ERROR", event: "Превышен лимит подключений на порту 3389", ip: "—", user: "system" },
  { time: "14:21:30", level: "INFO", event: "Сертификат SSL обновлён", ip: "—", user: "system" },
  { time: "14:18:12", level: "WARN", event: "Подключение с нового устройства", ip: "78.25.190.11", user: "manager" },
  { time: "14:10:05", level: "INFO", event: "Резервная копия конфигурации создана", ip: "—", user: "system" },
  { time: "13:55:33", level: "INFO", event: "Пользователь support добавлен", ip: "—", user: "admin" },
];

const users = [
  { name: "admin", role: "Суперадмин", sessions: 12, lastSeen: "Сейчас", status: "online", avatar: "А", twofa: true },
  { name: "developer", role: "Разработчик", sessions: 8, lastSeen: "Сейчас", status: "online", avatar: "Д", twofa: true },
  { name: "manager", role: "Менеджер", sessions: 3, lastSeen: "5 мин назад", status: "idle", avatar: "М", twofa: false },
  { name: "support", role: "Поддержка", sessions: 25, lastSeen: "2 ч назад", status: "offline", avatar: "П", twofa: false },
  { name: "analyst", role: "Аналитик", sessions: 5, lastSeen: "1 день назад", status: "offline", avatar: "А", twofa: true },
];

const analyticsData = [65, 82, 54, 90, 73, 88, 61, 95, 78, 84, 71, 92];
const analyticsLabels = ["19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

// --- Components ---
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; dot: string; text: string }> = {
    active: { label: "Активен", dot: "pulse-dot-green", text: "text-emerald-400" },
    idle: { label: "Простой", dot: "pulse-dot-cyan", text: "text-cyan-400" },
    closed: { label: "Закрыт", dot: "bg-gray-500", text: "text-gray-400" },
    blocked: { label: "Заблокирован", dot: "pulse-dot-red", text: "text-rose-400" },
    online: { label: "Онлайн", dot: "pulse-dot-green", text: "text-emerald-400" },
    offline: { label: "Офлайн", dot: "bg-gray-600", text: "text-gray-500" },
    open: { label: "Открыт", dot: "pulse-dot-green", text: "text-emerald-400" },
  };
  const s = map[status] || map.offline;
  return (
    <div className="flex items-center gap-2">
      <span className={`pulse-dot ${s.dot}`} />
      <span className={`text-xs font-medium font-mono-custom ${s.text}`}>{s.label}</span>
    </div>
  );
};

const LogLevel = ({ level }: { level: string }) => {
  const map: Record<string, string> = {
    INFO: "text-cyan-400 bg-cyan-400/10",
    WARN: "text-orange-400 bg-orange-400/10",
    ERROR: "text-rose-400 bg-rose-400/10",
  };
  return <span className={`text-xs font-mono-custom px-2 py-0.5 rounded-md font-semibold shrink-0 ${map[level]}`}>{level}</span>;
};

// --- Sections ---
const Dashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Активных сеансов", value: "3", icon: "Monitor", colorClass: "text-cyan-400", glow: "rgba(0,229,255,0.15)", trend: "+1 за час" },
        { label: "Всего сегодня", value: "47", icon: "Activity", colorClass: "text-violet-400", glow: "rgba(168,85,247,0.15)", trend: "+12 vs вчера" },
        { label: "Трафик", value: "3.3 МБ/с", icon: "Wifi", colorClass: "text-emerald-400", glow: "rgba(16,185,129,0.12)", trend: "↑ 8%" },
        { label: "Угроз заблокировано", value: "12", icon: "ShieldCheck", colorClass: "text-rose-400", glow: "rgba(244,63,94,0.12)", trend: "сегодня" },
      ].map((s, i) => (
        <div key={i} className={`stat-card p-5 animate-fade-in-up delay-${(i + 1) * 100}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.glow }}>
              <Icon name={s.icon} size={20} className={s.colorClass} />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${s.colorClass}`}>{s.value}</div>
          <div className="text-xs text-white/40 font-medium">{s.label}</div>
          <div className="text-xs text-white/25 mt-1 font-mono-custom">{s.trend}</div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 glass-card p-5 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white/90">Активные сеансы</h3>
          <span className="text-xs font-mono-custom text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">● LIVE</span>
        </div>
        <div className="space-y-3">
          {activeSessions.map((s, i) => (
            <div key={i} className="glass-card-hover rounded-xl p-3 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                  <Icon name="Monitor" size={16} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90">{s.user}</div>
                  <div className="text-xs text-white/40 font-mono-custom">{s.ip} · {s.location}</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-white/30">CPU</div>
                  <div className="text-sm font-semibold text-white/80 font-mono-custom">{s.cpu}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/30">Трафик</div>
                  <div className="text-sm font-semibold text-white/80 font-mono-custom">{s.bandwidth}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-white/30">Время</div>
                  <div className="text-sm font-semibold text-white/80 font-mono-custom">{s.duration}</div>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 animate-fade-in-up delay-400">
        <h3 className="font-semibold text-white/90 mb-1">Подключения за 12 дней</h3>
        <p className="text-xs text-white/30 mb-4 font-mono-custom">апрель 2026</p>
        <div className="flex items-end justify-between gap-1 h-32">
          {analyticsData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${(v / 100) * 100}%`,
                  background: i === analyticsData.length - 1 ? "linear-gradient(to top, #00e5ff, #a855f7)" : "rgba(255,255,255,0.1)",
                  animation: `grow-up 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 0.05}s forwards`,
                  transformOrigin: "bottom",
                  opacity: 0,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
          <div>
            <div className="text-xs text-white/30">Ср. в день</div>
            <div className="text-lg font-bold text-white/80">76.5</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/30">Пиковый</div>
            <div className="text-lg font-bold neon-cyan">95</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Sessions = () => {
  const [tab, setTab] = useState<"active" | "history">("active");
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-2 p-1 glass-card w-fit">
        {(["active", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-white/40 hover:text-white/70"}`}>
            {t === "active" ? "Активные" : "История"}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white/90">Активные сеансы ({activeSessions.length})</h3>
            <button className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors">
              <Icon name="XCircle" size={14} /> Завершить все
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {activeSessions.map((s, i) => (
              <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 min-w-32">
                  <span className="text-xs font-mono-custom text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg">{s.id}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/90">{s.user}</div>
                  <div className="text-xs text-white/40 font-mono-custom">{s.ip} · {s.os}</div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-center">
                  <div><div className="text-xs text-white/30">Порт</div><div className="font-mono-custom text-sm text-white/70">{s.port}</div></div>
                  <div><div className="text-xs text-white/30">CPU</div><div className="font-mono-custom text-sm text-emerald-400">{s.cpu}%</div></div>
                  <div><div className="text-xs text-white/30">Длит.</div><div className="font-mono-custom text-sm text-white/70">{s.duration}</div></div>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <Icon name="Eye" size={14} className="text-white/50" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center transition-colors">
                    <Icon name="X" size={14} className="text-rose-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold text-white/90">История сеансов</h3>
          </div>
          <div className="divide-y divide-white/5">
            {completedSessions.map((s, i) => (
              <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-wrap items-center gap-4">
                <span className="text-xs font-mono-custom text-white/40 bg-white/5 px-2 py-1 rounded-lg">{s.id}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/80">{s.user}</div>
                  <div className="text-xs text-white/30 font-mono-custom">{s.ip}</div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-center">
                  <div><div className="text-xs text-white/30">Дата</div><div className="text-xs text-white/60 font-mono-custom">{s.date}</div></div>
                  <div><div className="text-xs text-white/30">Длит.</div><div className="text-xs text-white/60 font-mono-custom">{s.duration}</div></div>
                </div>
                <div className="text-xs text-white/40">{s.reason}</div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Security = () => (
  <div className="space-y-4 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Icon name="ShieldCheck" size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white/90">Параметры безопасности</h3>
            <p className="text-xs text-white/40">Статус: защищено</p>
          </div>
        </div>
        {[
          { label: "Двухфакторная аутентификация", enabled: true },
          { label: "Шифрование AES-256", enabled: true },
          { label: "Белый список IP", enabled: true },
          { label: "Автоблокировка (15 мин)", enabled: false },
          { label: "Уведомления о входе", enabled: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <span className="text-sm text-white/70">{item.label}</span>
            <div className={`w-10 h-5 rounded-full transition-all cursor-pointer flex items-center px-0.5 ${item.enabled ? "bg-cyan-500/30 justify-end" : "bg-white/10 justify-start"}`}>
              <div className={`w-4 h-4 rounded-full ${item.enabled ? "bg-cyan-400" : "bg-white/30"}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Icon name="Network" size={20} className="text-violet-400" />
          </div>
          <h3 className="font-semibold text-white/90">Порты и протоколы</h3>
        </div>
        {[
          { port: "3389", proto: "RDP", status: "open", conns: 1 },
          { port: "22", proto: "SSH", status: "open", conns: 1 },
          { port: "5900", proto: "VNC", status: "open", conns: 1 },
          { port: "8080", proto: "HTTP Proxy", status: "closed", conns: 0 },
          { port: "443", proto: "HTTPS", status: "open", conns: 0 },
        ].map((p, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono-custom text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-lg">{p.port}</span>
              <span className="text-sm text-white/70">{p.proto}</span>
            </div>
            <div className="flex items-center gap-3">
              {p.conns > 0 && <span className="text-xs text-white/30">{p.conns} подкл.</span>}
              <StatusBadge status={p.status === "open" ? "active" : "closed"} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
          <Icon name="AlertTriangle" size={20} className="text-rose-400" />
        </div>
        <h3 className="font-semibold text-white/90">Заблокированные IP</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["91.108.4.12", "185.220.101.7", "178.162.55.44", "194.165.16.12"].map((ip, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
            <span className="text-xs font-mono-custom text-rose-300">{ip}</span>
            <button className="text-white/20 hover:text-white/60 transition-colors ml-2">
              <Icon name="X" size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Logs = () => (
  <div className="space-y-4 animate-fade-in">
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white/90">Системные логи</h3>
          <span className="text-xs font-mono-custom text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">● Live</span>
        </div>
        <div className="flex gap-2">
          {["ALL", "INFO", "WARN", "ERROR"].map(l => (
            <button key={l} className="text-xs px-2 py-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all font-mono-custom">
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="font-mono-custom text-xs divide-y divide-white/5">
        {logEntries.map((log, i) => (
          <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors ${log.level === "ERROR" ? "bg-rose-500/5" : log.level === "WARN" ? "bg-orange-500/5" : ""}`}>
            <span className="text-white/25 shrink-0 w-16">{log.time}</span>
            <LogLevel level={log.level} />
            <span className="flex-1 text-white/70 min-w-0">{log.event}</span>
            <span className="text-white/30 shrink-0 hidden md:block">{log.ip}</span>
            <span className="text-cyan-400/60 shrink-0 hidden md:block">{log.user}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Users = () => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center justify-end">
      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-all">
        <Icon name="UserPlus" size={16} /> Добавить
      </button>
    </div>
    <div className="glass-card overflow-hidden">
      <div className="divide-y divide-white/5">
        {users.map((u, i) => (
          <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {u.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white/90 font-mono-custom">{u.name}</span>
                {u.twofa && <span className="text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md">2FA</span>}
              </div>
              <div className="text-xs text-white/40">{u.role}</div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-center">
              <div><div className="text-xs text-white/30">Сеансов</div><div className="text-sm font-semibold text-white/80 font-mono-custom">{u.sessions}</div></div>
              <div><div className="text-xs text-white/30">Активность</div><div className="text-xs text-white/50 font-mono-custom">{u.lastSeen}</div></div>
            </div>
            <StatusBadge status={u.status} />
            <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0">
              <Icon name="Settings" size={14} className="text-white/40" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Analytics = () => (
  <div className="space-y-4 animate-fade-in">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Всего сеансов", value: "1 247", sub: "за 30 дней", colorClass: "text-cyan-400" },
        { label: "Среднее время", value: "1ч 24м", sub: "на сеанс", colorClass: "text-violet-400" },
        { label: "Пиковая нагрузка", value: "18–20ч", sub: "ежедневно", colorClass: "text-orange-400" },
        { label: "Уникальных IP", value: "89", sub: "за месяц", colorClass: "text-emerald-400" },
      ].map((s, i) => (
        <div key={i} className="stat-card p-5">
          <div className={`text-2xl font-bold mb-1 ${s.colorClass}`}>{s.value}</div>
          <div className="text-sm text-white/60 font-medium">{s.label}</div>
          <div className="text-xs text-white/25 font-mono-custom mt-1">{s.sub}</div>
        </div>
      ))}
    </div>

    <div className="glass-card p-5">
      <h3 className="font-semibold text-white/90 mb-4">Подключения по дням (апрель 2026)</h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {analyticsData.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-white/30 font-mono-custom">{v}</span>
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${(v / 100) * 100}%`,
                background: i >= 9 ? "linear-gradient(to top, rgba(0,229,255,0.5), rgba(168,85,247,0.4))" : "rgba(255,255,255,0.08)",
                animation: `grow-up 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 0.04}s forwards`,
                transformOrigin: "bottom",
                opacity: 0,
              }}
            />
            <span className="text-xs text-white/20 font-mono-custom">{analyticsLabels[i]}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white/90 mb-4">Загрузка по протоколам</h3>
        {[
          { proto: "RDP", pct: 62, color: "#00e5ff" },
          { proto: "SSH", pct: 25, color: "#a855f7" },
          { proto: "VNC", pct: 13, color: "#10b981" },
        ].map((p, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-white/70 font-mono-custom">{p.proto}</span>
              <span className="text-sm font-semibold" style={{ color: p.color }}>{p.pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${p.pct}%`, background: p.color + "80" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white/90 mb-4">Топ пользователей</h3>
        {users.slice(0, 4).map((u, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-sm text-white/30 font-mono-custom w-4">{i + 1}</span>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center text-xs font-bold text-white shrink-0">{u.avatar}</div>
            <div className="flex-1">
              <div className="text-sm text-white/80 font-mono-custom">{u.name}</div>
              <div className="progress-bar mt-1">
                <div className="progress-bar-fill" style={{ width: `${(u.sessions / 30) * 100}%`, background: "linear-gradient(to right,rgba(0,229,255,0.4),rgba(168,85,247,0.4))" }} />
              </div>
            </div>
            <span className="text-sm font-semibold text-white/60 font-mono-custom">{u.sessions}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Settings = () => (
  <div className="space-y-4 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white/90 mb-4">Общие настройки</h3>
        {[
          { label: "Имя сервера", value: "rc-server-01" },
          { label: "Макс. сеансов", value: "25" },
          { label: "Таймаут простоя (мин)", value: "15" },
        ].map((f, i) => (
          <div key={i} className="mb-4">
            <label className="text-xs text-white/40 block mb-1">{f.label}</label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/80 font-mono-custom">{f.value}</div>
          </div>
        ))}
        <button className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-all">
          Сохранить изменения
        </button>
      </div>
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white/90 mb-4">Резервные копии</h3>
        <div className="space-y-3">
          {["30 апр 2026 — 02:00", "29 апр 2026 — 02:00", "28 апр 2026 — 02:00"].map((d, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
              <div className="flex items-center gap-2">
                <Icon name="Database" size={14} className="text-violet-400" />
                <span className="text-sm text-white/70 font-mono-custom">{d}</span>
              </div>
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Восст.</button>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-400 text-sm font-semibold hover:bg-violet-500/25 transition-all flex items-center justify-center gap-2">
          <Icon name="Download" size={16} /> Создать резервную копию
        </button>
      </div>
    </div>
  </div>
);

// --- Navigation ---
const navItems: { id: Section; label: string; icon: string; badge?: string; group?: string }[] = [
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard", group: "Основное" },
  { id: "connections", label: "Подключения", icon: "PlugZap", badge: "100", group: "Основное" },
  { id: "messenger", label: "Мессенджер", icon: "MessageSquare", badge: "5", group: "Основное" },
  { id: "sessions", label: "Сеансы", icon: "Monitor", badge: "3", group: "Мониторинг" },
  { id: "logs", label: "Логи", icon: "ScrollText", group: "Мониторинг" },
  { id: "analytics", label: "Аналитика", icon: "BarChart2", group: "Мониторинг" },
  { id: "security", label: "Безопасность", icon: "Shield", group: "Управление" },
  { id: "users", label: "Пользователи", icon: "Users", group: "Управление" },
  { id: "settings", label: "Настройки", icon: "Settings", group: "Управление" },
];

const sectionTitles: Record<Section, string> = {
  dashboard: "Панель управления",
  connections: "Объекты подключения",
  messenger: "Мессенджер",
  sessions: "Управление сеансами",
  security: "Безопасность и конфигурация",
  logs: "Журнал событий",
  users: "Учётные записи",
  analytics: "Аналитика и производительность",
  settings: "Настройки системы",
};

// --- Main ---
export default function Index() {
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard />;
      case "connections": return <ConnectionsSection />;
      case "messenger": return <MessengerSection />;
      case "sessions": return <Sessions />;
      case "security": return <Security />;
      case "logs": return <Logs />;
      case "users": return <Users />;
      case "analytics": return <Analytics />;
      case "settings": return <Settings />;
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <div className="mesh-bg" />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "rgba(10,14,30,0.97)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(168,85,247,0.2))", border: "1px solid rgba(0,229,255,0.3)", boxShadow: "0 0 20px rgba(0,229,255,0.2)" }}
            >
              <Icon name="Cpu" size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-sm gradient-text-cyan">RemoteControl</div>
              <div className="text-xs text-white/25 font-mono-custom">v2.4.1</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 mx-3 mt-3 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div className="flex items-center gap-2">
            <span className="pulse-dot pulse-dot-green" />
            <span className="text-xs text-emerald-400 font-medium">Система работает</span>
          </div>
          <div className="text-xs text-white/25 font-mono-custom mt-0.5">Uptime: 14д 6ч 22м</div>
        </div>

        <nav className="flex-1 p-3 mt-2 overflow-y-auto space-y-4">
          {["Основное", "Мониторинг", "Управление"].map(group => (
            <div key={group}>
              <div className="text-xs text-white/20 font-mono-custom px-2 mb-1">{group}</div>
              {navItems.filter(i => i.group === group).map(item => (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                  className={`nav-item w-full ${section === item.id ? "active" : ""}`}
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                  {item.badge && (
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-mono-custom ${section === item.id ? "bg-cyan-500/30 text-cyan-300" : "bg-white/8 text-white/35"}`}>{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="nav-item cursor-default">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center text-xs font-bold text-white shrink-0">А</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/80 truncate">admin</div>
              <div className="text-xs text-white/25">Суперадмин</div>
            </div>
            <Icon name="ChevronRight" size={14} className="text-white/20" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: "rgba(10,14,30,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <Icon name="Menu" size={18} className="text-white/60" />
            </button>
            <div>
              <h1 className="font-bold text-white/90 text-lg leading-tight">{sectionTitles[section]}</h1>
              <p className="text-xs text-white/30 font-mono-custom">30 апреля 2026 · 14:38</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Icon name="Bell" size={17} className="text-white/50" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Icon name="RefreshCw" size={17} className="text-white/50" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-5 overflow-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}