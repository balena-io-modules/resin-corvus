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
const defaultContext = require('./default-context');
const utils = require('./utils');

const env = detect.getName();

module.exports = (SentryLib) => {
  const properties = {
    installed: false,
    enabled: true
  };

  return {

    /**
     * @summary Is Sentry installed?
     * @function
     * @public
     *
     * @returns {Boolean} Whether Sentry is installed
     *
     * @example
     * if (sentry.isInstalled()) {
     *   console.log('Sentry is installed');
     * }
     */
    isInstalled: () => properties.installed,

    /**
     * @summary Install Sentry client
     * @function
     * @public
     *
     * @param {String} dsn - Sentry Data Source Name
     * @param {Object} config Additional configuration passed to Sentry
     *
     * @example
     * sentry.install('https://<key>:<secret>@client.io/<project>', {
     *   release: '1.0.0',
     *   serverName: 'server1',
     *   disableConsoleAlerts: true
     * });
     */
    install: (dsn, config) => {
      if (properties.installed) {
        throw new Error('Sentry already installed');
      }

      const sentryConfig = _.cloneDeep(config);

      _.defaults(sentryConfig, {
        autoBreadcrumbs: true,
        allowSecretKey: true,
        dataCallback: utils.hideAbsolutePathsInObject
      });

      sentryConfig.extra = _.defaults(sentryConfig.extra, defaultContext[env]);

      properties.client = SentryLib.config(dsn, sentryConfig).install();
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
      if (!properties.installed) {
        throw new Error('Sentry not installed');
      }

      properties.client.uninstall();
      properties.installed = false;
    },

    /**
     * @summary Capture exception
     * @function
     * @public
     *
     * @example
     * sentry.captureException(exception)
     */
    captureException: (exception) => {
      if (!properties.installed) {
        throw new Error('Sentry not installed');
      }

      properties.client.captureException(exception);
    }
  };
};
