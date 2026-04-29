export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "online" | "offline" | "idle";
  lastSeen: string;
  twofa: boolean;
  bio: string;
}

export interface Message {
  id: string;
  from: string;
  text: string;
  time: string;
  type: "text" | "voice" | "image" | "video" | "document" | "audio" | "sticker";
  reactions: { emoji: string; users: string[] }[];
  replyTo?: string;
  edited?: boolean;
  disappearing?: boolean;
  seen?: boolean;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  transcript?: string;
}

export interface Chat {
  id: string;
  type: "direct" | "group";
  name: string;
  avatar: string;
  members: string[];
  admins?: string[];
  lastMessage: string;
  lastTime: string;
  unread: number;
  pinned?: boolean;
  muted?: boolean;
  encrypted: boolean;
  privacyLevel?: "open" | "closed" | "private";
  description?: string;
  pinnedMessages?: string[];
}

export const mockUsers: User[] = [
  { id: "admin", name: "Алексей Суперов", avatar: "А", role: "Суперадмин", status: "online", lastSeen: "Сейчас", twofa: true, bio: "Системный администратор" },
  { id: "developer", name: "Дмитрий Кодов", avatar: "Д", role: "Разработчик", status: "online", lastSeen: "Сейчас", twofa: true, bio: "Full-stack dev" },
  { id: "manager", name: "Марина Руслова", avatar: "М", role: "Менеджер", status: "idle", lastSeen: "5 мин назад", twofa: false, bio: "Управление проектами" },
  { id: "support", name: "Пётр Хелпов", avatar: "П", role: "Поддержка", status: "offline", lastSeen: "2 часа назад", twofa: false, bio: "Техподдержка L2" },
  { id: "analyst", name: "Анна Данилова", avatar: "А", role: "Аналитик", status: "online", lastSeen: "Сейчас", twofa: true, bio: "Бизнес-аналитик" },
  { id: "devops", name: "Игорь Деплоев", avatar: "И", role: "DevOps", status: "online", lastSeen: "Сейчас", twofa: true, bio: "Инфраструктура и CI/CD" },
  { id: "security", name: "Сергей Защитов", avatar: "С", role: "Безопасность", status: "idle", lastSeen: "10 мин назад", twofa: true, bio: "ИБ специалист" },
  { id: "qa", name: "Карина Тестова", avatar: "К", role: "QA Engineer", status: "offline", lastSeen: "1 час назад", twofa: false, bio: "Тестирование ПО" },
];

export const mockChats: Chat[] = [
  {
    id: "chat-general",
    type: "group",
    name: "Общий канал",
    avatar: "🏢",
    members: ["admin", "developer", "manager", "support", "analyst", "devops", "security", "qa"],
    admins: ["admin", "devops"],
    lastMessage: "Обновление сервера сегодня в 22:00",
    lastTime: "14:30",
    unread: 3,
    pinned: true,
    encrypted: true,
    privacyLevel: "open",
    description: "Общий канал команды",
    pinnedMessages: ["msg-001"],
  },
  {
    id: "chat-dev",
    type: "group",
    name: "Разработчики",
    avatar: "💻",
    members: ["admin", "developer", "devops", "qa"],
    admins: ["developer"],
    lastMessage: "PR #247 готов к ревью",
    lastTime: "13:55",
    unread: 1,
    encrypted: true,
    privacyLevel: "closed",
    description: "Чат команды разработки",
    pinnedMessages: [],
  },
  {
    id: "chat-infra",
    type: "group",
    name: "Инфраструктура",
    avatar: "⚙️",
    members: ["admin", "devops", "security"],
    admins: ["admin"],
    lastMessage: "Nginx config обновлён",
    lastTime: "12:10",
    unread: 0,
    encrypted: true,
    privacyLevel: "private",
  },
  {
    id: "dm-developer",
    type: "direct",
    name: "Дмитрий Кодов",
    avatar: "Д",
    members: ["admin", "developer"],
    lastMessage: "Окей, посмотрю сейчас",
    lastTime: "11:42",
    unread: 0,
    encrypted: true,
  },
  {
    id: "dm-manager",
    type: "direct",
    name: "Марина Руслова",
    avatar: "М",
    members: ["admin", "manager"],
    lastMessage: "Отчёт за апрель готов 📊",
    lastTime: "10:20",
    unread: 2,
    muted: true,
    encrypted: true,
  },
  {
    id: "dm-security",
    type: "direct",
    name: "Сергей Защитов",
    avatar: "С",
    members: ["admin", "security"],
    lastMessage: "🎤 Голосовое сообщение",
    lastTime: "09:15",
    unread: 0,
    encrypted: true,
  },
  {
    id: "dm-analyst",
    type: "direct",
    name: "Анна Данилова",
    avatar: "А",
    members: ["admin", "analyst"],
    lastMessage: "Посмотри данные за Q1",
    lastTime: "Вчера",
    unread: 0,
    encrypted: true,
  },
];

export const mockMessages: Record<string, Message[]> = {
  "chat-general": [
    { id: "msg-001", from: "devops", text: "🔔 Напоминание: обновление сервера сегодня в 22:00. Все сервисы будут недоступны ~15 минут.", time: "09:00", type: "text", reactions: [{ emoji: "👍", users: ["admin", "developer", "manager"] }, { emoji: "✅", users: ["security"] }], seen: true },
    { id: "msg-002", from: "admin", text: "Подтверждаю, подготовил резервную копию. Все OK.", time: "09:05", type: "text", reactions: [], replyTo: "msg-001", seen: true },
    { id: "msg-003", from: "developer", text: "Ребята, PR #247 готов — добавил новый модуль шифрования.", time: "13:55", type: "text", reactions: [{ emoji: "🚀", users: ["admin", "qa"] }], seen: true },
    { id: "msg-004", from: "security", text: "", time: "14:10", type: "voice", reactions: [], duration: "1:23", transcript: "Проверил безопасность нового модуля, замечаний нет. Можно мерджить." },
    { id: "msg-005", from: "manager", text: "Обновление сервера сегодня в 22:00", time: "14:30", type: "text", reactions: [], seen: false },
  ],
  "chat-dev": [
    { id: "dv-001", from: "developer", text: "Запустил новые тесты — все зелёные 🟢", time: "10:00", type: "text", reactions: [{ emoji: "🎉", users: ["qa", "admin"] }] },
    { id: "dv-002", from: "qa", text: "", time: "10:15", type: "document", reactions: [], fileName: "test_report_q1.pdf", fileSize: "2.4 МБ" },
    { id: "dv-003", from: "admin", text: "Отличная работа! Деплоим в пятницу.", time: "13:55", type: "text", reactions: [{ emoji: "🚀", users: ["developer", "qa", "devops"] }] },
  ],
  "dm-developer": [
    { id: "dd-001", from: "developer", text: "Привет! Глянь на конфиг Nginx — что-то с SSL.", time: "11:30", type: "text", reactions: [] },
    { id: "dd-002", from: "admin", text: "Смотрю сейчас.", time: "11:35", type: "text", reactions: [] },
    { id: "dd-003", from: "admin", text: "Нашёл проблему — истёк сертификат Let's Encrypt. Обновляю.", time: "11:40", type: "text", reactions: [{ emoji: "🙏", users: ["developer"] }], edited: true },
    { id: "dd-004", from: "developer", text: "Окей, посмотрю сейчас", time: "11:42", type: "text", reactions: [] },
  ],
  "dm-manager": [
    { id: "dm-001", from: "manager", text: "Отчёт за апрель готов 📊", time: "10:20", type: "text", reactions: [] },
    { id: "dm-002", from: "manager", text: "", time: "10:21", type: "document", reactions: [], fileName: "report_april_2026.xlsx", fileSize: "1.8 МБ" },
  ],
  "dm-security": [
    { id: "ds-001", from: "security", text: "", time: "09:15", type: "voice", reactions: [], duration: "0:47", transcript: "Зафиксировали подозрительную активность с IP 91.108.4.12 — три неудачных попытки входа. Заблокировал автоматически." },
  ],
};
