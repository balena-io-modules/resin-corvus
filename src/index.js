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
const utils = require('./utils');

const env = detect.getName();

const browserLike = env === 'browser' || env === 'phantom' || (env === 'electron' && process.type === 'renderer');

class ResinRaven {

  constructor() {
    this.sentryInstalled = false;
    this.mixpanelInstalled = false;

    /* eslint-disable global-require */
    this.RavenLib = browserLike ? require('raven-js/dist/raven') : require('raven');
    this.MixpanelLib = browserLike ? require('mixpanel-browser') : require('mixpanel');
    /* eslint-enable global-require */
  }

  install(sentry, mixpanel) {
    if (!sentry || !mixpanel) {
      throw new Error('Must provide at least one configuration (Sentry or Mixpanel');
    }

    if (sentry) {
      this.installSentry(sentry.dsn, sentry.options);
    }

    if (mixpanel) {
      this.installMixpanel(mixpanel.token, mixpanel.options);
    }
  }

  /**
   * @summary Configure Sentry client
   * @function
   * @public
   *
   * At a minimum, the options parameter must contain the release.
   * For information about the DSN, see https://docs.sentry.io/quickstart/#configure-the-dsn
   *
   * @param {Object} dsn - Sentry Data Source Name
   * @param {Object} settings
   *
   * @example
   * resinRaven.install(https://<key>:<secret>@sentry.io/<project>, { release: '1.0.0' });
   */
  installSentry(dsn, options) {
    if (this.sentryInstalled) {
      throw new Error('Sentry already set up');
    }

    if (!options || !options.release) {
      throw new Error('provide a release');
    }

    this.raven = this.RavenLib.config(dsn, options).install();
    this.sentryInstalled = true;
  }

  installMixpanel(token, options) {
    if (this.mixpanelInstalled) {
      throw new Error('Mixpanel already set up');
    }

    this.mixpanel = this.MixpanelLib.init(token, options);
    this.mixpanelInstalled = true;
  }

  installed() {
    return this.sentryInstalled || this.mixpanelInstalled;
  }

  uninstallSentry() {
    if (!this.sentryInstalled) {
      throw new Error('Sentry is not installed');
    }

    this.raven.uninstall();
    this.sentryInstalled = false;
  }

  uninstalllMixpanel() {
    if (!this.mixpanelInstalled) {
      throw new Error('Mixpanel is not installed');
    }

    this.mixpanel = undefined;
    this.mixpanelInstalled = false;
  }

  uninstall() {
    if (!this.sentryInstalled && !this.mixpanelInstalled) {
      throw new Error('Not installed');
    }

    if (this.sentryInstalled) {
      this.uninstallSentry();
    }

    if (this.mixpanelInstalled) {
      this.uninstalllMixpanel();
    }
  }

  setSentryContext(context) {
    if (!this.sentryInstalled) {
      throw new Error('Sentry is not installed');
    }

    if (browserLike) {
      this.raven.setUserContext(context.user);
      this.raven.setExtraContext(context.extra);
      this.raven.setTagsContext(context.tags);
    } else {
      this.raven.setContext(context);
    }
  }

  setMixpanelContext(context) {
    if (!this.mixpanelInstalled) {
      throw new Error('Mixpanel is not installed');
    }

    this.mixpanelContext = utils.transformForMixpanel(context);
  }

  setContext(context) {
    if (!this.installed()) {
      throw new Error('Not installed');
    }

    this.setSentryContext(context);
    this.setMixpanelContext(context);
  }

  captureMessage(message, context, sentry = true, mixpanel = true) {
    if (!this.installed()) {
      throw new Error('Not installed');
    }

    if (this.sentryInstalled && sentry) {
      this.raven.context(() => {
        this.setSentryContext(context);
        this.sentry.captureMessage(message);
      });
    }

    if (this.mixpanelInstalled && mixpanel) {
      this.mixpanel.track(message, Object.assign({}, this.mixpanelContext, context));
    }
  }
}

module.exports = new ResinRaven();
