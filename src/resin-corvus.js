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
const Mixpanel = require('./mixpanel');
const Sentry = require('./sentry');
const utils = require('./utils');

module.exports = (SentryLib, MixpanelLib, fake = false) => {
  const sentry = Sentry(SentryLib);
  const mixpanel = Mixpanel(MixpanelLib);
  const installedServices = [];
  let installed = false;
  let enabled = true;
  let consoleOutputDisabled = false;

  const getSupportedServices = () => ['sentry', 'mixpanel'];

  const logDebug = (message) => {
    const debugMessage = `${new Date()} ${message}`;

    if (!consoleOutputDisabled) {
      /* eslint-disable no-console */
      console.log(debugMessage);
      /* eslint-enable no-console */
    }
  };

  let shouldReportCallback = _.constant(true);

  const setShouldReport = (callback) => {
    if (!_.isFunction(callback)) {
      throw new Error('Function expected');
    } else {
      shouldReportCallback = callback;
    }
  };

  const shouldSendToExternalServices = () => enabled && !fake && shouldReportCallback();

  return {

    /**
     * @summary Supported services
     * @function
     * @public
     *
     * @returns Array of supported services
     *
     * @example
     * resinCorvus.getSupportedServices().map((service) => console.log(service));
     */
    getSupportedServices,

    /**
     * @summary Prepend date and log to console
     * @function
     * @public
     *
     * @example
     * resinCorvus.logDebug('Debug info');
     */
    logDebug,

    /**
     * @summary Enable logging
     * @function
     * @public
     *
     * @example
     * resinCorvus.enable();
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
     * resinCorvus.disable();
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
     * if (resinCorvus.isEnabled()) {
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
     *     serverName: 'server1',
     *     shouldReportCallback: () => true,
     *     consoleOutputDisabled: true
     *   }
     * });
     */
    install: (config) => {
      consoleOutputDisabled = Boolean(config.options.disableConsoleOutput);

      if (fake) {
        return;
      }

      if (installed) {
        throw new Error('Already installed');
      }

      installed = true;

      if (!_.isNil(config.options.shouldReport)) {
        setShouldReport(config.options.shouldReport);
      }

      Object.keys(config.services).forEach((serviceName) => {
        if (!getSupportedServices().includes(serviceName)) {
          throw new Error(`Service not supported: ${serviceName}`);
        }

        if (serviceName === 'sentry' && !_.isNil(config.services.sentry)) {
          sentry.install(config.services.sentry, {
            release: config.options.release,
            serverName: config.options.serverName,
            disableConsoleAlerts: consoleOutputDisabled
          });
          installedServices.push('sentry');
        }

        if (serviceName === 'mixpanel' && !_.isNil(config.services.mixpanel)) {
          mixpanel.install(config.services.mixpanel, {
            version: config.options.release,
            serverName: config.options.serverName
          });

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
     * resinCorvus.logEvent('Close modal', {
     *   userAccepted: false
     * });
     */
    logEvent: (message, data) => {
      const debugMessage = _.attempt(() => {
        if (data) {
          return `${message} (${JSON.stringify(data)})`;
        }

        return message;
      });

      logDebug(debugMessage);

      if (shouldSendToExternalServices() && installedServices.includes('mixpanel')) {
        mixpanel.track(message, data);
      }
    },

    /**
     * @summary Log error
     * @function
     * @public
     *
     * @param {Error} error
     */
    logException: (error) => {
      if (!consoleOutputDisabled) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-disable no-console */
      }

      if (!installedServices.includes('sentry') || !shouldSendToExternalServices() || !utils.shouldReportError(error)) {
        return;
      }

      sentry.captureException(error);
    },

    /**
     * @summary Set function to check if events should be reported to external services
     * @function
     * @public
     *
     * @param {Function} callback
     */
    shouldReport: setShouldReport,

    /**
     * @summary Disable console output
     * @function
     * @public
     */
    disableConsoleOutput: () => {
      consoleOutputDisabled = true;
    },

    /**
     * @summary Enable console output
     * @function
     * @public
     */
    enableConsoleOutput: () => {
      consoleOutputDisabled = false;
    }
  };
};
