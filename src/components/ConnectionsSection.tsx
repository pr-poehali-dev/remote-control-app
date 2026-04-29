import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { connections, type Connection } from "@/data/connections";

const StatusDot = ({ status }: { status: Connection["status"] }) => {
  const map = { online: "pulse-dot-green", offline: "bg-gray-600", busy: "pulse-dot-cyan" };
  return <span className={`pulse-dot ${map[status]}`} />;
};

export default function ConnectionsSection() {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Все");
  const [filterStatus, setFilterStatus] = useState("Все");
  const [selected, setSelected] = useState<Connection | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const groups = ["Все", ...Array.from(new Set(connections.map(c => c.group)))];
  const statuses = ["Все", "online", "offline", "busy"];

  const filtered = useMemo(() => connections.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.ip.includes(q) || c.host.toLowerCase().includes(q);
    const matchGroup = filterGroup === "Все" || c.group === filterGroup;
    const matchStatus = filterStatus === "Все" || c.status === filterStatus;
    return matchSearch && matchGroup && matchStatus;
  }), [search, filterGroup, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statusLabel: Record<string, string> = { online: "Онлайн", offline: "Офлайн", busy: "Занят" };
  const statusColor: Record<string, string> = { online: "text-emerald-400", offline: "text-gray-500", busy: "text-cyan-400" };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Поиск по имени, IP, хосту..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white/80 outline-none focus:border-cyan-500/40 font-mono-custom placeholder:text-white/25"
          />
        </div>
        <select value={filterGroup} onChange={e => { setFilterGroup(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none">
          {groups.map(g => <option key={g} value={g} className="bg-gray-900">{g}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none">
          {statuses.map(s => <option key={s} value={s} className="bg-gray-900">{s === "Все" ? "Все статусы" : statusLabel[s]}</option>)}
        </select>
        <div className="text-xs text-white/30 font-mono-custom ml-auto">{filtered.length} объектов</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* List */}
        <div className="xl:col-span-2 glass-card overflow-hidden">
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {paged.map((c) => (
              <button key={c.id} onClick={() => { setSelected(c); setShowPass(false); }}
                className={`w-full text-left p-3.5 hover:bg-white/[0.03] transition-colors flex items-center gap-3 ${selected?.id === c.id ? "bg-cyan-500/5 border-l-2 border-cyan-500" : ""}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: c.status === "online" ? "rgba(16,185,129,0.1)" : c.status === "busy" ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.05)" }}>
                  <Icon name={c.protocol === "SSH" ? "Terminal" : c.protocol === "VNC" ? "MonitorPlay" : "Monitor"} size={16}
                    className={c.status === "online" ? "text-emerald-400" : c.status === "busy" ? "text-cyan-400" : "text-white/30"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white/90 truncate">{c.name}</span>
                    {c.autoAccess && <span className="text-xs bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-md shrink-0">Авто</span>}
                  </div>
                  <div className="text-xs text-white/35 font-mono-custom">{c.id} · {c.ip} · {c.protocol}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusDot status={c.status} />
                  <span className={`text-xs font-mono-custom ${statusColor[c.status]}`}>{statusLabel[c.status]}</span>
                </div>
              </button>
            ))}
            {paged.length === 0 && (
              <div className="py-12 text-center text-white/25 text-sm">Ничего не найдено</div>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-white/5 flex items-center justify-between">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 disabled:opacity-30 transition-colors">
                ← Назад
              </button>
              <span className="text-xs text-white/30 font-mono-custom">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 disabled:opacity-30 transition-colors">
                Вперёд →
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="glass-card p-5">
          {selected ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white/90 text-base leading-tight">{selected.name}</h3>
                  <span className="text-xs text-white/35 font-mono-custom">{selected.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={selected.status} />
                  <span className={`text-xs font-mono-custom ${statusColor[selected.status]}`}>{statusLabel[selected.status]}</span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { icon: "Globe", label: "Хост", val: selected.host },
                  { icon: "MapPin", label: "IP", val: selected.ip },
                  { icon: "Hash", label: "Порт", val: String(selected.port) },
                  { icon: "Network", label: "Протокол", val: selected.protocol },
                  { icon: "Cpu", label: "ОС", val: selected.os },
                  { icon: "MapPinned", label: "Локация", val: selected.location },
                  { icon: "FolderOpen", label: "Группа", val: selected.group },
                  { icon: "Clock", label: "Uptime", val: selected.uptime },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-white/40">
                      <Icon name={icon} size={13} />
                      {label}
                    </div>
                    <span className="font-mono-custom text-white/70 text-xs">{val}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>CPU {selected.cpu}%</span><span>RAM {selected.ram}%</span>
                </div>
                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${selected.cpu}%`, background: selected.cpu > 75 ? "#f43f5e80" : "#00e5ff60" }} /></div>
                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${selected.ram}%`, background: selected.ram > 80 ? "#f43f5e80" : "#a855f760" }} /></div>
              </div>

              {/* Password */}
              <div>
                <div className="text-xs text-white/40 mb-1 flex items-center gap-1"><Icon name="KeyRound" size={12} /> Пароль</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-mono-custom text-xs text-white/80">
                    {showPass ? selected.password : "●●●●●●●●●●●●●●●●"}
                  </div>
                  <button onClick={() => setShowPass(p => !p)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                    <Icon name={showPass ? "EyeOff" : "Eye"} size={14} className="text-white/50" />
                  </button>
                  <button onClick={() => navigator.clipboard?.writeText(selected.password)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                    <Icon name="Copy" size={14} className="text-white/50" />
                  </button>
                </div>
              </div>

              {/* Auto-access */}
              <div className="p-3 rounded-xl border" style={{ background: selected.autoAccess ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.03)", borderColor: selected.autoAccess ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <Icon name={selected.autoAccess ? "Zap" : "ZapOff"} size={15} className={selected.autoAccess ? "text-violet-400" : "text-white/30"} />
                  <span className="text-sm font-semibold" style={{ color: selected.autoAccess ? "#a855f7" : "rgba(255,255,255,0.4)" }}>
                    {selected.autoAccess ? "Авто-доступ активен" : "Требуется авторизация"}
                  </span>
                </div>
                <p className="text-xs text-white/30 mt-1 ml-5">
                  {selected.autoAccess ? "После первой авторизации доступ без пароля" : "Каждый раз требуется ввод пароля"}
                </p>
              </div>

              <button className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(168,85,247,0.2))", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff" }}>
                <Icon name="PlugZap" size={16} /> Подключиться
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <Icon name="MousePointerClick" size={24} className="text-white/20" />
              </div>
              <p className="text-white/25 text-sm">Выберите объект из списка</p>
              <p className="text-white/15 text-xs mt-1 font-mono-custom">100 объектов доступно</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
