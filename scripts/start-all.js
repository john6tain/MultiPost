const { spawn } = require("child_process");

const children = [];

function start(name, command) {
  const child = spawn(command, {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[${name}] exited with signal ${signal}`);
    } else {
      console.log(`[${name}] exited with code ${code}`);
    }
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start:`, error.message);
  });

  children.push(child);
}

function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down child processes...`);
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start("backend", "npm --prefix backend run start");
start("mobile-app", "npm --prefix mobile-app run start");
