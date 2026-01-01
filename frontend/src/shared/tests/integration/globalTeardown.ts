declare global {
  var __BACKEND_PROCESS__: import('child_process').ChildProcess;
}

export default async function globalTeardown(): Promise<void> {
  if (global.__BACKEND_PROCESS__) {
    global.__BACKEND_PROCESS__.kill('SIGTERM');
    console.log('Backend stopped');
  }
}
