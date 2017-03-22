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

const detect = require('detect-process');
const ResinMixpanelClient = require('resin-mixpanel-client');
const prepareForMixpanel = require('./prepare-for-mixpanel');
const defaultContext = require('./default-context');

const env = detect.getName();

const properties = {
  installed: false,
  enabled: true
};

const isInstalled = () => properties.installed;

module.exports = {
  /**
   * @summary Is Mixpanel installed?
   * @function
   * @public
   *
   * @returns {Boolean} Whether Mixpanel is installed
   *
   * @example
   * if (mixpanel.isInstalled()) {
   *   console.log('Mixpanel is installed');
   * }
   */
  isInstalled,

  /**
  * @summary Install Mixpanel client
  * @function
  * @public
  *
  * @param {Object} token
  * @param {Object} options
  *
  * @example
  * mixpanel.install('YOUR_TOKEN');
  */
  install: (token, fake = false) => {
    if (fake) {
      properties.fake = true;
      properties.installed = true;
      return;
    }

    if (isInstalled()) {
      throw new Error('Mixpanel already installed');
    }

    properties.client = ResinMixpanelClient(token);
    properties.client.set(defaultContext[env]);
    properties.installed = true;
  },

  /**
   * @summary Uninstall Sentry client
   * @function
   * @public
   *
   * @example
   * sentry.uninstall()
   */
  uninstall: () => {
    if (properties.fake) {
      properties.installed = false;
      return;
    }

    if (!isInstalled()) {
      throw new Error('Mixpanel not installed');
    }

    properties.client = undefined;
  },

  /**
   * @summary Track message in Mixpanel
   * @function
   * @public
   *
   * @param {String} message
   * @param {Object} data
   */
  track: (message, data) => {
    if (properties.fake) {
      return;
    }

    if (!isInstalled()) {
      throw new Error('Mixpanel not installed');
    }

    properties.client.track(message, prepareForMixpanel(data));
  }
};
