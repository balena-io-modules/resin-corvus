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

const isBrowserLike = require('../is-browser-like');

module.exports = (SentryLib) => {
  const properties = {
    installed: false
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
     * At a minimum, the options parameter must contain the release.
     * For information about the DSN, see https://docs.sentry.io/quickstart/#configure-the-dsn
     *
     * @param {Object} dsn - Sentry Data Source Name
     * @param {Object} options
     *
     * @example
     * sentry.install({
     *   dsn: 'https://<key>:<secret>@client.io/<project>',
     *   options: {
     *     release: '1.0.0'
     *   }
     * });
     */
    install: (config) => {
      if (properties.installed) {
        throw new Error('Sentry already installed');
      }

      if (!config.options || !config.options.release) {
        throw new Error('provide a release');
      }

      properties.client = SentryLib.config(config.dsn, config.options).install();
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
     * @summary Set context to send to Sentry
     * @function
     * @public
     *
     * @param {Object} context
     */
    setContext: (context) => {
      if (!properties.installed) {
        throw new Error('Sentry not installed');
      }

      if (isBrowserLike()) {
        this.raven.setUserContext(context.user);
        this.raven.setExtraContext(context.extra);
        this.raven.setTagsContext(context.tags);
      } else {
        this.raven.setContext(context);
      }
    },

    captureMessage: (message, context) => {
      if (!properties.installed) {
        throw new Error('Sentry not installed');
      }

      properties.client.context(() => {
        exports.setContext(context);
        properties.client.captureMessage(message);
      });
    },

    captureException: (exception, context) => {
      if (!properties.installed) {
        throw new Error('Sentry not installed');
      }

      properties.client.context(() => {
        exports.setContext(context);
        properties.client.captureException(exception, context);
      });
    }
  };
};
