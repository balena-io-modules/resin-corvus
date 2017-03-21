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
const prepareForMixpanel = require('./prepare-for-mixpanel');

module.exports = (MixpanelLib) => {
  const properties = {};
  const isInstalled = () => !_.isUndefined(properties.client);

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
    * @param {Object} token
    * @param {Object} options
    *
    * @example
    * mixpanel.install({
    *   token: 'YOUR_TOKEN',
    *   options: {
    *     protocol: 'https'
    *   }
    * });
    */
    install: (config) => {
      if (isInstalled()) {
        throw new Error('Mixpanel already installed');
      }

      properties.client = MixpanelLib.init(config.token, config.options);
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

      properties.client = undefined;
      properties.context = {};
    },

    /**
     * @summary Set context to send to Mixpanel
     * @function
     * @public
     *
     * @param {Object} context
     */
    setContext: (context) => {
      if (!isInstalled()) {
        throw new Error('Mixpanel not installed');
      }

      properties.context = prepareForMixpanel(context);
    },

    /**
     * @summary Track message in Mixpanel
     * @param {String} message
     * @param {Object} context
     */
    captureMessage: (message, context) => {
      if (!isInstalled()) {
        throw new Error('Mixpanel not installed');
      }

      properties.client.track(message, Object.assign({}, properties.context, context));
    }

  // TODO: captureException

  };
};
