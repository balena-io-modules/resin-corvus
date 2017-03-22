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
const mixpanel = require('./mixpanel');
const Sentry = require('./sentry');

module.exports = (SentryLib, fake = false) => {
  const sentry = Sentry(SentryLib);
  const installedServices = [];
  let installed = false;
  let enabled = true;

  const getSupportedServices = () => ['sentry', 'mixpanel'];

  const logDebug = (message) => {
    const debugMessage = `${new Date()} ${message}`;

    /* eslint-disable no-console */
    console.log(debugMessage);
    /* eslint-enable no-console */
  };

  return {

    /**
     * @summary Supported services
     * @function
     * @public
     *
     * @returns Array of supported services
     *
     * @example
     * resinRaven.getSupportedServices().map((service) => console.log(service));
     */
    getSupportedServices,

    /**
     * @summary Prepend date and log to console
     * @function
     * @public
     *
     * @example
     * resinRaven.logDebug('Debug info');
     */
    logDebug,

    /**
     * @summary Enable logging
     * @function
     * @public
     *
     * @example
     * resinRaven.enable();
     */
    enable: () => {
      enabled = true;
    },

    /**
     * @summary Disable logging
     * @function
     * @public
     *
     * @example
     * resinRaven.disable();
     */
    disable: () => {
      enabled = false;
    },

    /**
     * @summary Is logging enabled?
     * @function
     * @public
     *
     * @example
     * if (resinRaven.isEnabled()) {
     *   console.log('Logging enabled');
     * }
     */
    isEnabled: () => enabled && !fake,

    /**
     * @summary Installed services
     * @function
     * @public
     *
     * @returns Array of installed services
     *
     * @example
     * services.getInstalledServices().map((service) => console.log(service));
     */
    getInstalledServices: () => installedServices,

    /**
     * @summary Install service
     *
     * @param {Object} config
     *
     * @example
     * services.install({
     *   services: {
     *     sentry: 'https://<key>:<secret>@client.io/<project>',
     *     mixpanel: 'YOUR_TOKEN'
     *   },
     *   options: {
     *     release: '1.0.0',
     *     serverName: 'staging'
     *   }
     * });
     */
    install: (config) => {
      if (fake) {
        return;
      }

      if (installed) {
        throw new Error('Already installed');
      }

      installed = true;

      Object.keys(config.services).forEach((serviceName) => {
        if (!getSupportedServices().includes(serviceName)) {
          throw new Error(`Service not supported: ${serviceName}`);
        }

        if (serviceName === 'sentry') {
          sentry.install(
            config.services.sentry,
            config.options.release,
            config.options.serverName
          );
          installedServices.push('sentry');
        }

        if (serviceName === 'mixpanel') {
          mixpanel.install(config.services.mixpanel);
          installedServices.push('mixpanel');
        }
      });
    },

    /**
     * @summary Log event
     * @function
     * @public
     *
     * @param {String} message
     * @param {Object} data
     *
     * @example
     * resinRaven.logEvent('Close modal', {
     *   userAccepted: false
     * });
     */
    logEvent: (message, data) => {
      if (!enabled || fake) {
        return;
      }

      if (installedServices.includes('mixpanel')) {
        mixpanel.track(message, data);
      }

      const debugMessage = _.attempt(() => {
        if (data) {
          return `${message} (${JSON.stringify(data)})`;
        }

        return message;
      });

      logDebug(debugMessage);
    },

    /**
     * @summary Log exception
     * @function
     * @public
     *
     * @param {Error} exception
     */
    logException: (exception) => {
      if (!enabled || fake) {
        return;
      }

      sentry.captureException(exception);

      /* eslint-disable no-console */
      console.error(exception);
      /* eslint-disable no-console */
    }
  };
};
