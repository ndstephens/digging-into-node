#! /usr/bin/env node

'use strict';

// const util = require('util');
const path = require('path');
const fs = require('fs');
const Transform = require('stream').Transform;
const zlib = require('zlib');

// Capture the CLI arguments (remove first 2)
const args = require('minimist')(process.argv.slice(2), {
  boolean: ['help', 'in', 'out', 'compress', 'uncompress'],
  string: ['file'],
});

// Can now control setting the base path using a temporary environment variable
// When providing with the command it only work for that single command
const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

// File to store output instead of sending to stdout
let OUTFILE = path.join(BASE_PATH, 'files', 'out.txt');

// Argument handling
if (args.help) {
  printHelp();
} else if (args.in || args._.includes('-')) {
  processFile(process.stdin);
} else if (args.file) {
  // Create a readable stream that can be piped to a writeable stream
  const stream = fs.createReadStream(path.join(BASE_PATH, args.file));
  processFile(stream);
} else {
  error('Incorrect usage.', true);
}

/* =============================================
              UTILITY FUNCTIONS
============================================= */
function processFile(inStream) {
  // Put our input stream into a variable for further processing
  let outStream = inStream;

  // if "--uncompress" flag exists (is true)
  if (args.uncompress) {
    // Create a writeable stream for un-compressing
    const ungzipStream = zlib.createGunzip();
    outStream = outStream.pipe(ungzipStream);
  }

  // Create a writeable stream that transforms what is piped into it
  const upperCaseTransformStream = new Transform({
    transform(chunk, encoding, cb) {
      // "chunk" is a Buffer
      // The transform stream is similar to an array, so to add something to it:
      this.push(chunk.toString().toUpperCase());
      // Inform the stream that a chunk has been processed and can move on:
      cb();
    },
  });

  // Apply transform stream to uppercase all the letters
  outStream = outStream.pipe(upperCaseTransformStream);

  // If "--compress" flag exists (is true)
  if (args.compress) {
    // Create a writeable stream for compressing
    const gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    // Update the file extension
    OUTFILE = `${OUTFILE}.gz`;
  }

  // Decide on which writeable stream for the final output (stdout or file)
  let targetStream;
  // If "--out" flag exists (is true)
  if (args.out) {
    // stdout is a writeable stream
    targetStream = process.stdout;
  } else {
    // create a writeable stream to a file
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log('');
    printHelp();
  }
}

function printHelp() {
  console.log('ex2 usage:');
  console.log('  ex2.js --file={FILENAME}');
  console.log('');
  console.log('--help               print this help');
  console.log('--file={FILENAME}    process the file');
  console.log('--in, -              process stdin');
  console.log('--out                print to stdout');
  console.log('--compress           gzip the output');
  console.log('--uncompress         un-gzip the output');
  console.log('');
}
