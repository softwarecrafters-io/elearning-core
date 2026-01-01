import { spawn, ChildProcess } from 'child_process';
import path from 'path';

declare global {
  var __BACKEND_PROCESS__: ChildProcess;
  var __BACKEND_PORT__: number;
}

const backendPort = 3099;

async function waitForServer(url: string, maxAttempts = 120): Promise<void> {
  console.log(`Waiting for server at ${url}...`);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`Server is ready after ${i + 1} attempts`);
        return;
      }
    } catch (error) {
      // Server not ready yet
      if (i % 10 === 0 && i > 0) {
        console.log(`Still waiting... (${i}/${maxAttempts})`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server at ${url} did not start within ${maxAttempts} seconds`);
}

export default async function globalSetup(): Promise<void> {
  const backendDir = path.resolve(__dirname, '../../../../../backend');
  const showLogs = process.env.DEBUG === '1';

  const backendProcess = spawn('npm', ['run', 'start:test'], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(backendPort),
      TEST_OTP: '123456',
      LOG_LEVEL: 'silent',
    },
    stdio: 'pipe',
    shell: true,
  });

  if (showLogs) {
    backendProcess.stdout?.on('data', (data) => {
      console.log(`[backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr?.on('data', (data) => {
      console.error(`[backend error] ${data.toString().trim()}`);
    });
  }

  backendProcess.on('error', (error) => {
    console.error(`[backend spawn error] ${error.message}`);
  });

  global.__BACKEND_PROCESS__ = backendProcess;
  global.__BACKEND_PORT__ = backendPort;

  await waitForServer(`http://localhost:${backendPort}/health`);
  console.log(`Backend started on port ${backendPort}`);
}
