const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const USE_TUNNEL = process.argv.includes('--tunnel');

const children = [];

function run(command, args, opts = {}) {
  const child = spawn(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    ...opts,
  });
  children.push(child);
  return child;
}

function updateEnvVar(key, value) {
  let content = fs.readFileSync(ENV_PATH, 'utf8');
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, 'm');
  content = regex.test(content) ? content.replace(regex, line) : `${content}\n${line}\n`;
  fs.writeFileSync(ENV_PATH, content);
}

async function waitForNgrokUrl(retries = 20) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch('http://127.0.0.1:4040/api/tunnels');
      const data = await res.json();
      const tunnel = (data.tunnels || []).find((t) => t.proto === 'https');
      if (tunnel) return tunnel.public_url;
    } catch {
      // ngrok hali tayyor emas, qayta urinamiz
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return null;
}

async function main() {
  console.log('[dev] Mini App ishga tushirilmoqda (http://localhost:5173)...');
  run('npm', ['run', 'dev'], { cwd: path.join(ROOT, 'mini-app') });

  console.log('[dev] Admin Panel ishga tushirilmoqda (http://localhost:5174)...');
  run('npm', ['run', 'dev'], { cwd: path.join(ROOT, 'admin-panel') });

  if (USE_TUNNEL) {
    console.log('[dev] ngrok tunnel ochilmoqda (5173-portga)...');
    run('ngrok', ['http', '5173', '--log=stdout']);

    const url = await waitForNgrokUrl();
    if (url) {
      console.log(`[dev] ngrok manzili: ${url}`);
      updateEnvVar('WEBAPP_URL', url);
      console.log("[dev] .env dagi WEBAPP_URL yangilandi. Diqqat: bot menyu tugmasi/inline tugmalar shu manzilni ishlatadi.");
    } else {
      console.warn("[dev] OGOHLANTIRISH: ngrok manzilini olib bo'lmadi, WEBAPP_URL eski qoladi.");
    }
  }

  console.log('[dev] Backend ishga tushirilmoqda (http://localhost:4000)...');
  run('node', ['src/index.js']);
}

function shutdown() {
  console.log("\n[dev] Barcha jarayonlar to'xtatilmoqda...");
  children.forEach((child) => {
    try {
      child.kill();
    } catch {
      // jarayon allaqachon to'xtagan bo'lishi mumkin
    }
  });
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main();
