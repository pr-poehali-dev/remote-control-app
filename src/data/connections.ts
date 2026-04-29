export interface Connection {
  id: string;
  name: string;
  host: string;
  ip: string;
  port: number;
  protocol: string;
  os: string;
  location: string;
  password: string;
  autoAccess: boolean;
  status: "online" | "offline" | "busy";
  lastConnected: string;
  group: string;
  cpu: number;
  ram: number;
  uptime: string;
}

function genPass(seed: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
  let result = "";
  let s = seed * 1664525 + 1013904223;
  for (let i = 0; i < 16; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    result += chars[Math.abs(s) % chars.length];
  }
  return result;
}

const osOptions = ["Windows 11 Pro", "Windows Server 2022", "Ubuntu 22.04 LTS", "CentOS 9", "macOS 14 Sonoma", "Debian 12", "RHEL 9", "Windows 10 Pro"];
const locations = ["Москва", "Санкт-Петербург", "Екатеринбург", "Новосибирск", "Казань", "Самара", "Краснодар", "Ростов-на-Дону", "Уфа", "Пермь"];
const protocols = ["RDP", "SSH", "VNC", "RDP", "SSH", "RDP"];
const ports: Record<string, number> = { RDP: 3389, SSH: 22, VNC: 5900 };
const groups = ["Серверы БД", "Веб-серверы", "Рабочие станции", "Резервные", "Тестовые", "Продакшн"];

const names = [
  "Главный сервер приложений", "База данных PostgreSQL", "Веб-сервер Nginx", "Резервный контроллер домена",
  "Сервер мониторинга Grafana", "Jenkins CI/CD узел", "Балансировщик нагрузки HAProxy", "Хранилище MinIO",
  "Сервер 1С Предприятие", "Почтовый сервер Exchange", "Файловый сервер SMB", "Сервер видеоконференций",
  "Антивирусный сервер Dr.Web", "Сервер логов ELK Stack", "Redis кэш-сервер", "RabbitMQ брокер сообщений",
  "Docker Registry", "GitLab CE сервер", "Nexus репозиторий", "Zabbix мониторинг",
  "ПК Иванов И.И.", "ПК Петрова М.С.", "ПК Сидоров А.В.", "ПК Козлова Н.Р.", "ПК Новиков Д.О.",
  "ПК Морозов К.Е.", "ПК Волкова Т.С.", "ПК Алексеев В.П.", "ПК Лебедева О.Г.", "ПК Семёнов Р.А.",
  "Тестовый стенд QA-01", "Тестовый стенд QA-02", "Тестовый стенд QA-03", "Стейдж-сервер Frontend",
  "Стейдж-сервер Backend", "Dev-окружение Docker", "Сервер нагрузочного тестирования", "Selenium Grid узел",
  "Сервер метрик Prometheus", "Alertmanager инстанс",
  "Резервный сервер баз данных", "Реплика MySQL", "Реплика MongoDB", "ClickHouse аналитика",
  "Hadoop DataNode-01", "Hadoop DataNode-02", "Kafka брокер-01", "Kafka брокер-02",
  "Spark кластер мастер", "Spark воркер-01",
  "VPN-шлюз OpenVPN", "Межсетевой экран pfSense", "Прокси-сервер Squid", "DNS-сервер BIND",
  "DHCP-сервер", "NTP-сервер", "RADIUS-сервер", "LDAP Active Directory", "Certificate Authority",
  "Сервер управления сетью",
  "Сервер резервного копирования Veeam", "Архивное хранилище Tape", "Offsite backup EU",
  "Disaster Recovery VM", "Тонкий клиент зала А", "Тонкий клиент зала Б", "Терминальный сервер-01",
  "Терминальный сервер-02", "Citrix Delivery Controller", "VMware vCenter",
  "ESXi хост-01", "ESXi хост-02", "ESXi хост-03", "ESXi хост-04",
  "Hyper-V кластер мастер", "Hyper-V узел-01", "Hyper-V узел-02",
  "Kubernetes мастер", "Kubernetes воркер-01", "Kubernetes воркер-02",
  "Сервер аудита и SOC", "SIEM система QRadar", "Антидос Arbor", "WAF ModSecurity",
  "IDS/IPS Snort", "PAM-система CyberArk", "HashiCorp Vault", "Keycloak SSO",
  "Сервер телефонии Asterisk", "FreePBX АТС", "Видеонаблюдение NVR", "Сервер печати CUPS",
  "Сервер обновлений WSUS", "MDM Jamf Pro", "ITSM ServiceDesk", "SAP Application Server",
  "Oracle DB сервер", "MS SQL Server", "Сервер криптографии", "Планировщик задач Airflow",
  "Сервер BI Tableau", "Power BI Gateway", "Интеграционная шина ESB", "Геосервер GeoServer",
  "Медицинская система МИАС", "Кассовый сервер 1С:Розница", "Сервер ЭДО",
];

export const connections: Connection[] = Array.from({ length: 100 }, (_, i) => {
  const proto = protocols[i % protocols.length];
  const os = osOptions[i % osOptions.length];
  const loc = locations[i % locations.length];
  const statusOpts: Connection["status"][] = ["online", "online", "online", "offline", "busy"];
  return {
    id: `RC-${String(i + 1).padStart(3, "0")}`,
    name: names[i] || `Объект подключения ${i + 1}`,
    host: `host-${String(i + 1).padStart(3, "0")}.corp.local`,
    ip: `10.${Math.floor(i / 50)}.${Math.floor((i % 50) / 10)}.${(i % 10) + 1}`,
    port: ports[proto],
    protocol: proto,
    os,
    location: loc,
    password: genPass(i * 7919 + 31337),
    autoAccess: i % 3 !== 0,
    status: statusOpts[i % 5],
    lastConnected: i % 3 === 0 ? "Сейчас" : i % 3 === 1 ? `${i % 59 + 1} мин назад` : `${i % 23 + 1}ч назад`,
    group: groups[i % groups.length],
    cpu: (i * 17 + 5) % 90,
    ram: (i * 13 + 20) % 95,
    uptime: `${(i * 3 + 1) % 30}д ${(i * 7) % 24}ч`,
  };
});
