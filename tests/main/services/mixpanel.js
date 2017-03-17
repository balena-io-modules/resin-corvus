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

const chai = require('chai');
const sinon = require('sinon');
const mixpanel = require('../../../src/services/mixpanel');

describe('Services: Mixpanel', () => {
  const config = {
    token: 'YOUR_TOKEN',
    options: {
      protocol: 'https'
    }
  };

  beforeEach(() => {
    sinon.spy(mixpanel.MixpanelLib, 'init');
  });

  afterEach(() => {
    if (mixpanel.isInstalled()) {
      mixpanel.uninstall();
    }
    mixpanel.MixpanelLib.init.restore();
  });

  it('uses the correct library in the Electron main thread', () => {
    /* eslint-disable global-require */
    chai.expect(mixpanel.MixpanelLib).to.equal(require('mixpanel'));
    /* eslint-enable global-require */
  });

  describe('install()', () => {
    it('throws if mixpanel is already installed', () => {
      mixpanel.install(config);
      chai.expect(() => mixpanel.install(config)).to.throw(Error);
    });

    it('calls MixpanelLib.init() with correct parameters', () => {
      mixpanel.install(config);
      chai.expect(mixpanel.MixpanelLib.init.calledOnce).to.be.true;
      chai.expect(mixpanel.MixpanelLib.init.calledWith(config.token, config.options)).to.be.true;
    });
  });

  describe('isInstalled()', () => {
    it('is false when mixpanel is not installed', () => {
      chai.expect(mixpanel.isInstalled()).to.be.false;
    });

    it('is true when mixpanel is installed', () => {
      mixpanel.install(config);
      chai.expect(mixpanel.isInstalled()).to.be.true;
    });

    it('is false after uninstall', () => {
      mixpanel.install(config);
      mixpanel.uninstall();
      chai.expect(mixpanel.isInstalled()).to.be.false;
    });
  });

  describe('uninstall()', () => {
    it('throws if mixpanel is not installed', () => {
      chai.expect(() => mixpanel.uninstall()).to.throw(Error);
    });
  });
});

