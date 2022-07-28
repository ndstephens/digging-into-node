#! /usr/bin/env node

'use strict';

// const util = require('util');
const path = require('path');
const fs = require('fs');

// Wrapper for working with stdin
const getStdin = require('get-stdin');

// Capture the CLI arguments
const args = require('minimist')(process.argv.slice(2), {
  boolean: ['help', 'in'],
  string: ['file'],
});

// Can now control setting the base path using a temporary environment variable
// When providing with the command it only work for that single command
const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

// Argument handling
if (args.help) {
  printHelp();
} else if (args.in || args._.includes('-')) {
  getStdin().then(processFile).catch(error);
} else if (args.file) {
  fs.readFile(
    path.join(BASE_PATH, args.file),
    function onContent(err, contents) {
      if (err) {
        error(err.toString());
      } else {
        processFile(contents.toString());
      }
    }
  );
} else {
  error('Incorrect usage.', true);
}

/* =============================================
              UTILITY FUNCTIONS
============================================= */
function processFile(contents) {
  contents = contents.toUpperCase();
  process.stdout.write(contents);
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log('');
    printHelp();
  }
}

function printHelp() {
  console.log('ex1 usage:');
  console.log('  ex1.js --file={FILENAME}');
  console.log('');
  console.log('--help               print this help');
  console.log('--file={FILENAME}    process the file');
  console.log('--in, -              process stdin');
  console.log('');
}
