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
const utils = require('./utils');

/**
 * @summary Mixpanel library used; exported for testing purposes
 * @public
 */
exports.MixpanelLib = utils.browserLike() ? require('mixpanel-browser') : require('mixpanel');

const properties = {};

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
exports.isInstalled = () => !_.isUndefined(properties.client);

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
exports.install = (config) => {
  if (exports.isInstalled()) {
    throw new Error('Mixpanel already installed');
  }

  properties.client = exports.MixpanelLib.init(config.token, config.options);
};

/**
 * @summary Uninstall Sentry client
 * @function
 * @public
 *
 * @example
 * sentry.uninstall()
 */
exports.uninstall = () => {
  if (!exports.isInstalled()) {
    throw new Error('Mixpanel not installed');
  }

  properties.client = undefined;
  properties.context = {};
};

/**
 * @summary Set context to send to Mixpanel
 * @function
 * @public
 *
 * @param {Object} context
 */
exports.setContext = (context) => {
  if (!exports.isInstalled()) {
    throw new Error('Mixpanel not installed');
  }

  properties.context = utils.prepareObjectForMixpanel(context);
};

/**
 * @summary Track message in Mixpanel
 * @param {String} message
 * @param {Object} context
 */
exports.captureMessage = (message, context) => {
  if (!properties.installed()) {
    throw new Error('Mixpanel not installed');
  }

  properties.client.track(message, Object.assign({}, properties.context, context));
};

// TODO: captureException
