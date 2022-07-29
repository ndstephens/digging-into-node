'use strict';

var fetch = require('node-fetch');

// ************************************

const HTTP_PORT = 8039;

main().catch(() => 1);

// ************************************

async function main() {
  try {
    const res = await fetch('http://localhost:8039/get-records');
    if (res?.ok) {
      const records = await res.json();
      if (records?.length) {
        process.exitCode = 0;
        return;
      }
    }
  } catch (err) {}

  process.exitCode = 1;
}
