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

'use strict'

const chai = require('chai')
const sinon = require('sinon')
const MixpanelLib = require('mixpanel')
const Mixpanel = require('../src/mixpanel')

describe('Services: Mixpanel', () => {
  const mixpanel = Mixpanel(MixpanelLib)
  const token = 'YOUR_TOKEN'

  beforeEach(() => {
    sinon.spy(MixpanelLib, 'init')
  })

  afterEach(() => {
    if (mixpanel.isInstalled()) {
      mixpanel.uninstall()
    }
    MixpanelLib.init.restore()
  })

  describe('install()', () => {
    it('throws if mixpanel is already installed', () => {
      mixpanel.install(token)
      chai.expect(() => mixpanel.install(token)).to.throw(Error)
    })
  })

  describe('isInstalled()', () => {
    it('is false when mixpanel is not installed', () => {
      chai.expect(mixpanel.isInstalled()).to.equal(false)
    })

    it('is true when mixpanel is installed', () => {
      mixpanel.install(token)
      chai.expect(mixpanel.isInstalled()).to.equal(true)
    })

    it('is false after uninstall', () => {
      mixpanel.install(token)
      mixpanel.uninstall()
      chai.expect(mixpanel.isInstalled()).to.equal(false)
    })
  })

  describe('uninstall()', () => {
    it('throws if mixpanel is not installed', () => {
      chai.expect(() => mixpanel.uninstall()).to.throw(Error)
    })
  })
})
