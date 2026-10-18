import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const script = process.argv[2];
if (!script) {
  throw new Error('A package script name is required.');
}

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
const rootEnvironment = parseEnv(readFileSync(envPath, 'utf8'));
const packageManagerCli = process.env.npm_execpath;
if (!packageManagerCli) {
  throw new Error('Run this command through pnpm so npm_execpath is available.');
}

const child = spawn(process.execPath, [packageManagerCli, 'run', script], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, ...rootEnvironment },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exitCode = code ?? 1;
});

