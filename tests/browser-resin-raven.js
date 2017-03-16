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
const RavenLib = require('raven-js/dist/raven');
const MixpanelLib = require('mixpanel-browser');

describe('Browser ResinRaven', () => {
  it('uses the correct RavenLib library', () => {
    chai.expect(resinRaven.RavenLib).to.equal(RavenLib);
  });

  it('uses the correct Mixpanel library', () => {
    chai.expect(resinRaven.MixpanelLib).to.equal(MixpanelLib);
  });
});
