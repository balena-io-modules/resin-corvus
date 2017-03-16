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

const resinRaven = require('../src/index');
const chai = require('chai');
const sinon = require('sinon');

describe('ResinRaven', () => {
  const sentryDSN = 'https://xxx:yyy@sentry.io/100000';
  const sentryOptions = {
    release: '1.0.0',
  };
  const mixpanelToken = 'YOUR_TOKEN';
  const mixpanelOptions = { protocol: 'https' };

  beforeEach(() => {
    sinon.spy(resinRaven.RavenLib, 'config');
    sinon.spy(resinRaven.RavenLib, 'install');
    sinon.spy(resinRaven.RavenLib, 'uninstall');
    sinon.spy(resinRaven.MixpanelLib, 'init');
  });

  afterEach(() => {
    if (resinRaven.installed()) {
      resinRaven.uninstall();
    }
    resinRaven.RavenLib.config.restore();
    resinRaven.RavenLib.install.restore();
    resinRaven.RavenLib.uninstall.restore();
    resinRaven.MixpanelLib.init.restore();
  });

  describe('installSentry()', () => {
    it('throws if release is missing', () => {
      const sentry = { sentryDSN, options: {} };
      chai.expect(() => resinRaven.install({ sentry })).to.throw(Error);
    });

    it('throws if Sentry is already installed', () => {
      resinRaven.installSentry(sentryDSN, sentryOptions);
      chai.expect(() => resinRaven.installSentry(sentryDSN, sentryOptions)).to.throw(Error);
    });

    it('calls RavenLib.config() with correct parameters', () => {
      resinRaven.installSentry(sentryDSN, sentryOptions);
      chai.expect(resinRaven.RavenLib.config.calledOnce).to.be.true;
      chai.expect(resinRaven.RavenLib.config.calledWith(sentryDSN, sentryOptions)).to.be.true;
    });

    it('calls RavenLib.install() after RavenLib.config()', () => {
      resinRaven.installSentry(sentryDSN, sentryOptions);
      chai.expect(resinRaven.RavenLib.install.calledAfter(resinRaven.RavenLib.config));
    });

    it('sets the installed flags correctly', () => {
      chai.expect(resinRaven.installed()).to.be.false;
      chai.expect(resinRaven.sentryInstalled).to.be.false;
      chai.expect(resinRaven.mixpanelInstalled).to.be.false;

      resinRaven.installSentry(sentryDSN, sentryOptions);

      chai.expect(resinRaven.installed()).to.be.true;
      chai.expect(resinRaven.sentryInstalled).to.be.true;
      chai.expect(resinRaven.mixpanelInstalled).to.be.false;
    });
  });

  describe('uninstallSentry()', () => {
    it('throws if Sentry is not installed', () => {
      chai.expect(() => resinRaven.uninstallSentry()).to.throw(Error);
    });

    it('calls RavenLib.uninstall()', () => {
      resinRaven.installSentry(sentryDSN, sentryOptions);
      resinRaven.uninstallSentry();
      chai.expect(resinRaven.RavenLib.uninstall.calledOnce).to.be.true;
    });

    it('unsets the installed flag', () => {
      resinRaven.installSentry(sentryDSN, sentryOptions);
      resinRaven.uninstallSentry();
      chai.expect(resinRaven.sentryInstalled).to.be.false;
    });
  });

  describe('installMixpanel()', () => {
    it('throws if Mixpanel is already installed', () => {
      resinRaven.installMixpanel(mixpanelToken, mixpanelOptions);
      chai.expect(() => resinRaven.installMixpanel(mixpanelToken, mixpanelOptions)).to.throw(Error);
    });

    it('calls MixpanelLib.init() with the correct parameters', () => {
      resinRaven.installMixpanel(mixpanelToken, mixpanelOptions);
      chai.expect(resinRaven.MixpanelLib.init.calledOnce).to.be.true;
      chai.expect(resinRaven.MixpanelLib.init.calledWith(
        mixpanelToken, mixpanelOptions)).to.be.true;
    });

    it('sets the installed flags correctly', () => {
      chai.expect(resinRaven.installed()).to.be.false;
      chai.expect(resinRaven.sentryInstalled).to.be.false;
      chai.expect(resinRaven.mixpanelInstalled).to.be.false;

      resinRaven.installMixpanel(mixpanelToken, mixpanelOptions);

      chai.expect(resinRaven.installed()).to.be.true;
      chai.expect(resinRaven.mixpanelInstalled).to.be.true;
      chai.expect(resinRaven.sentryInstalled).to.be.false;
    });
  });

  describe('uninstallMixpanel()', () => {
    it('throws if Mixpanel is not installed', () => {
      chai.expect(() => resinRaven.uninstalllMixpanel()).to.throw(Error);
    });

    it('unsets the installed flag', () => {
      resinRaven.installMixpanel(sentryDSN, sentryOptions);
      resinRaven.uninstalllMixpanel();
      chai.expect(resinRaven.mixpanelInstalled).to.be.false;
    });
  });
});
