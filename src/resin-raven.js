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

const Sentry = require('./services/sentry');
const Mixpanel = require('./services/mixpanel');

module.exports = (SentryLib, MixpanelLib) => {
  const sentry = Sentry(SentryLib);
  const mixpanel = Mixpanel(MixpanelLib);

  const services = { sentry, mixpanel };
  const installedServices = [];

  return {

    /**
     * @summary Supported services
     * @function
     * @public
     *
     * @returns Array of supported services
     *
     * @example
     * services.supportedServices().map((service) => console.log(service));
     */
    supportedServices: () => ['sentry', 'mixpanel'],

    /**
     * summary Install service
     *
     * @param service
     *
     * @example
     * services.install({
     *   sentry: {
     *     dsn: 'https://<key>:<secret>@client.io/<project>',
     *     options: {
     *       release: '1.0.0'
     *     }
     *   }
     * })
     */
    install: (service) => {
      if (!exports.supportedServices.includes(service.name)) {
        throw new Error('Service not supported');
      }

      if (service.name === 'sentry') {
        sentry.install(service.config);
      }

      if (service.name === 'mixpanel') {
        mixpanel.install(service.config);
      }

      installedServices.push(service.name);
    },

    /**
     * @summary Uninstall service
     * @function
     * @public
     *
     * @param serviceName
     *
     * @example
     * services.uninstall('sentry');
     */
    uninstall: (serviceName) => {
      if (!exports.supportedServices().includes(serviceName)) {
        throw new Error(`Unknown service: ${serviceName}`);
      }

      if (!installedServices.includes(serviceName)) {
        throw new Error(`Service not installed: ${serviceName}`);
      }

      services[serviceName].uninstall();
    },

    /**
     * @summary Sets context for all installed services
     * @function
     * @public
     *
     * @param context
     *
     * @example
     * resinRaven.setContext({
     *   user: 'joe'
     * });
     */
    setContext: (context) => {
      installedServices.forEach((service) => {
        service.setContext(context);
      });
    },

    /**
     * @summary Send message to all installed services
     * @function
     * @public
     *
     * @description
     * The context passed to this function is not saved as it is the one passed to `setContext`.
     * It is an additional one-time context.
     *
     * @param {String} message
     * @param {Object} context
     *
     * @example
     * resinRaven.captureMessage('Informational message', { user: 'john' });
     */
    captureMessage: (message, context) => {
      installedServices.forEach((service) => {
        service.captureMessage(message, context);
      });
    }
  };
};
