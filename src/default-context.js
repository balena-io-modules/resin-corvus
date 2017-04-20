/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const arch = require('arch');
const os = require('os');
const osLocale = require('os-locale');

/**
 * @summary Get host architecture
 * @function
 * @private
 *
 * @description
 * We need this because node's os.arch() returns the process architecture
 * See: https://github.com/nodejs/node-v0.x-archive/issues/2862
 *
 * @returns {String} Host architecture
 *
 * @example
 * if (getHostArchitecture() === 'x64') {
 *   console.log('Host architecture is x64');
 * }
 */
const getHostArchitecture = () => {
  if (['ia32', 'x64'].includes(process.arch)) {
    return arch().replace('x86', 'ia32');
  }
  return process.arch;
};

module.exports.node = {
  arch: process.arch,
  node: process.version,
  osPlatform: os.platform(),
  osRelease: os.release(),
  cpuCores: os.cpus().length,
  totalMemory: os.totalmem(),
  startFreeMemory: os.freemem(),
  hostArch: getHostArchitecture(),
  locale: osLocale.sync()
};

module.exports.electron = Object.assign({}, module.exports.node, {
  electron: process.versions.electron
});

module.exports.browser = {};
