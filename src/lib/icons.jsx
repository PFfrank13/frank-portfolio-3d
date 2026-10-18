import {
  siPython, siReact, siNodedotjs, siFastapi, siDocker, siKotlin, siCplusplus, siArduino, siOdoo,
  siOllama, siAndroid, siGit, siGithub, siJavascript, siTailwindcss, siVite, siSupabase, siOpenai,
  siOpenjdk, siThreedotjs, siPostgresql, siMysql, siTypescript, siLinux, siSqlite,
  siKeycloak, siOpentelemetry, siPostman, siHtml5, siCss3, siGooglegemini, siKaggle, siClaude, siAmazonwebservices, siCisco, siMqtt, siRaspberrypi, siGooglecloud, siGithubactions, siNginx,
} from 'simple-icons';

/** Íconos de marca monocromos (usan currentColor) + glifos propios para lo que no tiene marca. */
const BRAND = {
  python: siPython, react: siReact, node: siNodedotjs, fastapi: siFastapi, docker: siDocker,
  kotlin: siKotlin, cpp: siCplusplus, arduino: siArduino, odoo: siOdoo, ollama: siOllama,
  android: siAndroid, git: siGit, github: siGithub, javascript: siJavascript, tailwind: siTailwindcss,
  vite: siVite, supabase: siSupabase, openai: siOpenai, java: siOpenjdk, three: siThreedotjs,
  postgresql: siPostgresql, mysql: siMysql, typescript: siTypescript, linux: siLinux, sqlite: siSqlite,
  keycloak: siKeycloak, opentelemetry: siOpentelemetry, postman: siPostman, html5: siHtml5, css3: siCss3, gemini: siGooglegemini,
  kaggle: siKaggle, claude: siClaude, aws: siAmazonwebservices, cisco: siCisco, mqtt: siMqtt, raspberrypi: siRaspberrypi,
  googlecloud: siGooglecloud, githubactions: siGithubactions, nginx: siNginx,
};

const CUSTOM = {
  db: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  nfc: (
    <>
      <path d="M6 8.5a5.5 5.5 0 0 1 0 7" />
      <path d="M9.5 6a9 9 0 0 1 0 12" />
      <path d="M13 3.5a12.5 12.5 0 0 1 0 17" />
      <circle cx="17.5" cy="12" r="1.4" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
    </>
  ),
  voice: (
    <>
      <path d="M4 12v0M8 8v8M12 4v16M16 8v8M20 12v0" />
    </>
  ),
  cube: (
    <>
      <path d="M12 2.5l8.5 4.7v9.6L12 21.5l-8.5-4.7V7.2z" />
      <path d="M12 12l8.5-4.8M12 12L3.5 7.2M12 12v9.5" />
    </>
  ),
};

export const ICON_KEYS = [...Object.keys(BRAND), ...Object.keys(CUSTOM)].sort();

export function ToolIcon({ name, size = 22, className = '', title }) {
  const brand = BRAND[name];
  if (brand) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role={title ? 'img' : 'presentation'} aria-label={title} className={className}>
        <path d={brand.path} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : 'presentation'} aria-label={title} className={className}>
      {CUSTOM[name] || CUSTOM.cube}
    </svg>
  );
}
