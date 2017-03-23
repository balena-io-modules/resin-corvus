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

const _ = require('lodash');
const detect = require('detect-process');
const prepareForMixpanel = require('./prepare-for-mixpanel');
const defaultContext = require('./default-context');

module.exports = (MixpanelLib) => {
  const env = detect.getName();

  const properties = {
    installed: false
  };

  const isInstalled = () => properties.installed;

  return {
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
     * @param {String} token
     *
     * @example
     * mixpanel.install('YOUR_TOKEN');
     */
    install: (token) => {
      if (isInstalled()) {
        throw new Error('Mixpanel already installed');
      }

      MixpanelLib.init(token);
      properties.context = prepareForMixpanel(defaultContext[env]);
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
      if (!isInstalled()) {
        throw new Error('Mixpanel not installed');
      }

      properties.installed = false;
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
      if (!isInstalled()) {
        throw new Error('Mixpanel not installed');
      }

      const context = Object.assign({}, properties.context, prepareForMixpanel(data))

      MixpanelLib.track(message, context);
    }
  };
};
