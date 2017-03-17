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
const utils = require('../../../src/services/utils');

describe('Services: Utils', () => {
  describe('prepareObjectForMixpanel()', () => {
    it('should return undefined if given undefined', () => {
      chai.expect(utils.prepareObjectForMixpanel(undefined)).to.be.undefined;
    });

    it('should return flat object with start case keys if given nested object', () => {
      const object = {
        person: {
          firstName: 'John',
          lastName: 'Doe',
          address: {
            streetNumber: 13,
            streetName: 'Elm'
          }
        }
      };

      chai.expect(utils.prepareObjectForMixpanel(object)).to.deep.equal({
        'Person First Name': 'John',
        'Person Last Name': 'Doe',
        'Person Address Street Number': 13,
        'Person Address Street Name': 'Elm'
      });
    });

    it('should return an object with the key `value` if given `false`', () => {
      chai.expect(utils.prepareObjectForMixpanel(false)).to.deep.equal({
        Value: false
      });
    });

    it('should return an object with the key `value` if given `null`', () => {
      chai.expect(utils.prepareObjectForMixpanel(null)).to.deep.equal({
        Value: null
      });
    });

    it('should preserve environment variable', () => {
      chai.expect(utils.prepareObjectForMixpanel({
        ETCHER_DISABLE_UPDATES: true
      })).to.deep.equal({
        ETCHER_DISABLE_UPDATES: true
      });
    });

    it('should preserve environment variables inside objects', () => {
      chai.expect(utils.prepareObjectForMixpanel({
        foo: {
          FOO_BAR_BAZ: 3
        },
      })).to.deep.equal({
        'Foo FOO_BAR_BAZ': 3
      });
    });

    it('should insert space after key starting with number', () => {
      chai.expect(utils.prepareObjectForMixpanel({
        foo: {
          '1key': 1
        },
      })).to.deep.equal({
        'Foo 1 Key': 1
      });
    });

    it('should not modify start case keys', () => {
      chai.expect(utils.prepareObjectForMixpanel({
        Foo: {
          'Start Case Key': 42
        },
      })).to.deep.equal({
        'Foo Start Case Key': 42
      });
    });

    it('should not modify arrays', () => {
      chai.expect(utils.prepareObjectForMixpanel([1, 2, {
        nested: 3
      }])).to.deep.equal([1, 2, {
        Nested: 3
      }]);
    });

    it('should not modify nested arrays', () => {
      chai.expect(utils.prepareObjectForMixpanel({
        values: [1, 2, {
          nested: 3
        }],
      })).to.deep.equal({
        Values: [1, 2, {
          Nested: 3
        }],
      });
    });

    it('should leave nested arrays nested', () => {
      chai.expect(utils.prepareObjectForMixpanel(
        [1, 2, [3, 4]])
      ).to.deep.equal([1, 2, [3, 4]]);
    });
  });
});
