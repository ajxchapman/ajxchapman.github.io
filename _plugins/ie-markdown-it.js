#!/usr/bin/env node
/*eslint no-console:0*/

'use strict';


var fs = require('fs');
var argparse = require('argparse');


////////////////////////////////////////////////////////////////////////////////

var cli = new argparse.ArgumentParser({
  prog: 'markdown-it',
  version: 1.0,
  addHelp: true
});

cli.addArgument([ '--summary' ], {
  help:   'Output footnote-links inline suitable for summarys or excerpts',
  action: 'storeTrue'
});

cli.addArgument([ '--no-html' ], {
  help:   'Disable embedded HTML',
  action: 'storeTrue'
});

cli.addArgument([ '-l', '--linkify' ], {
  help:   'Autolink text',
  action: 'storeTrue'
});

cli.addArgument([ '-t', '--typographer' ], {
  help:   'Enable smartquotes and other typographic replacements',
  action: 'storeTrue'
});

cli.addArgument([ '--trace' ], {
  help:   'Show stack trace on error',
  action: 'storeTrue'
});

cli.addArgument([ 'file' ], {
  help: 'File to read',
  nargs: '?',
  defaultValue: '-'
});

var options = cli.parseArgs();


function readFile(filename, encoding, callback) {
  if (options.file === '-') {
    // read from stdin
    var chunks = [];

    process.stdin.on('data', function (chunk) { chunks.push(chunk); });

    process.stdin.on('end', function () {
      return callback(null, Buffer.concat(chunks).toString(encoding));
    });
  } else {
    fs.readFile(filename, encoding, callback);
  }
}


////////////////////////////////////////////////////////////////////////////////

readFile(options.file, 'utf8', function (err, input) {
  var output, md, plugin_footnote_links, plugin_prism;

  if (err) {
    if (err.code === 'ENOENT') {
      console.error('File not found: ' + options.file);
      process.exit(2);
    }

    console.error(
      options.trace && err.stack ||
      err.message ||
      String(err));

    process.exit(1);
  }

  plugin_footnote_links = require("markdown-it-footnote-links");
  plugin_prism = require('markdown-it-prism');
  md = require('markdown-it')({
    html: !options['no-html'],
    xhtmlOut: true,
    breaks: true,
    typographer: options.typographer,
    linkify: options.linkify
  }).use(plugin_footnote_links, options.summary)
    .use(plugin_prism, { plugins: ["line-highlight"] });

  try {
    output = md.render(input);

  } catch (e) {
    console.error(
      options.trace && e.stack ||
      e.message ||
      String(e));

    process.exit(1);
  }

  process.stdout.write(output);
});
