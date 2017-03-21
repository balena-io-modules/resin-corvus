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
const SentryLib = require('raven');
const Sentry = require('../src/sentry');

describe('Services: Sentry', () => {
  const sentry = Sentry(SentryLib);

  const config = {
    dsn: 'https://xxx:yyy@client.io/100000',
    options: {
      release: '1.0.0'
    }
  };

  beforeEach(() => {
    sinon.spy(SentryLib, 'config');
    sinon.spy(SentryLib, 'install');
    sinon.spy(SentryLib, 'uninstall');
  });

  afterEach(() => {
    if (sentry.isInstalled()) {
      sentry.uninstall();
    }
    SentryLib.config.restore();
    SentryLib.install.restore();
    SentryLib.uninstall.restore();
  });

  describe('install()', () => {
    it('throws if release is missing', () => {
      chai.expect(() => sentry.install({ dsn: config.dsn })).to.throw(Error);
    });

    it('throws if Sentry is already installed', () => {
      sentry.install(config);
      chai.expect(() => sentry.install(config)).to.throw(Error);
    });

    it('calls SentryLib.config() with correct parameters', () => {
      sentry.install(config);
      chai.expect(SentryLib.config.calledOnce).to.be.true;
      chai.expect(SentryLib.config.calledWith(config.dsn, config.options)).to.be.true;
    });

    it('calls SentryLib.install() after SentryLib.config()', () => {
      sentry.install(config);
      chai.expect(SentryLib.install.calledAfter(SentryLib.config));
    });
  });

  describe('isInstalled()', () => {
    it('is false when sentry is not installed', () => {
      chai.expect(sentry.isInstalled()).to.be.false;
    });

    it('is true when sentry is installed', () => {
      sentry.install(config);
      chai.expect(sentry.isInstalled()).to.be.true;
    });

    it('is false after uninstall', () => {
      sentry.install(config);
      sentry.uninstall();
      chai.expect(sentry.isInstalled()).to.be.false;
    });
  });

  describe('uninstall()', () => {
    it('throws if Sentry is not installed', () => {
      chai.expect(() => sentry.uninstall()).to.throw(Error);
    });

    it('calls SentryLib.uninstall()', () => {
      sentry.install(config);
      sentry.uninstall();
      chai.expect(SentryLib.uninstall.calledOnce).to.be.true;
    });
  });
});

