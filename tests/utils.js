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
const path = require('path');
const utils = require('../src/utils');

describe('Utils', () => {
  describe('flattenStartCase()', () => {
    it('should return undefined if given undefined', () => {
      chai.expect(utils.flattenStartCase(undefined)).to.be.undefined;
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

      chai.expect(utils.flattenStartCase(object)).to.deep.equal({
        'Person First Name': 'John',
        'Person Last Name': 'Doe',
        'Person Address Street Number': 13,
        'Person Address Street Name': 'Elm'
      });
    });

    it('should return an object with the key `value` if given `false`', () => {
      chai.expect(utils.flattenStartCase(false)).to.deep.equal({
        Value: false
      });
    });

    it('should return an object with the key `value` if given `null`', () => {
      chai.expect(utils.flattenStartCase(null)).to.deep.equal({
        Value: null
      });
    });

    it('should preserve environment variable', () => {
      chai.expect(utils.flattenStartCase({
        ETCHER_DISABLE_UPDATES: true
      })).to.deep.equal({
        ETCHER_DISABLE_UPDATES: true
      });
    });

    it('should preserve environment variables inside objects', () => {
      chai.expect(utils.flattenStartCase({
        foo: {
          FOO_BAR_BAZ: 3
        },
      })).to.deep.equal({
        'Foo FOO_BAR_BAZ': 3
      });
    });

    it('should insert space after key starting with number', () => {
      chai.expect(utils.flattenStartCase({
        foo: {
          '1key': 1
        },
      })).to.deep.equal({
        'Foo 1 Key': 1
      });
    });

    it('should not modify start case keys', () => {
      chai.expect(utils.flattenStartCase({
        Foo: {
          'Start Case Key': 42
        },
      })).to.deep.equal({
        'Foo Start Case Key': 42
      });
    });

    it('should not modify arrays', () => {
      chai.expect(utils.flattenStartCase([1, 2, {
        nested: 3
      }])).to.deep.equal([1, 2, {
        Nested: 3
      }]);
    });

    it('should not modify nested arrays', () => {
      chai.expect(utils.flattenStartCase({
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
      chai.expect(utils.flattenStartCase(
        [1, 2, [3, 4]])
      ).to.deep.equal([1, 2, [3, 4]]);
    });
  });

  describe('.hideAbsolutePathsInObject()', () => {
    it('should return undefined if given undefined', () => {
      chai.expect(utils.hideAbsolutePathsInObject(undefined)).to.be.undefined;
    });

    it('should return null if given null', () => {
      chai.expect(utils.hideAbsolutePathsInObject(null)).to.be.null;
    });

    it('should return a clone of the object if there are no paths in the object', () => {
      const object = {
        numberProperty: 1,
        nested: {
          otherProperty: 'value'
        }
      };
      chai.expect(utils.hideAbsolutePathsInObject(object)).to.not.equal(object);
      chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal(object);
    });

    describe('given UNIX paths', () => {
      beforeEach(() => {
        this.isAbsolute = path.isAbsolute;
        this.basename = path.basename;
        path.isAbsolute = path.posix.isAbsolute;
        path.basename = path.posix.basename;
      });

      afterEach(() => {
        path.isAbsolute = this.isAbsolute;
        path.basename = this.basename;
      });

      it('should replace absolute paths with the basename', () => {
        const object = {
          prop1: 'some value',
          prop2: '/home/john/rpi.img'
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          prop1: 'some value',
          prop2: 'rpi.img'
        });
      });

      it('should replace nested absolute paths with the basename', () => {
        const object = {
          nested: {
            path: '/home/john/rpi.img'
          }
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          nested: {
            path: 'rpi.img'
          }
        });
      });

      it('should not alter /dev/sdb', () => {
        const object = {
          nested: {
            path: '/dev/sdb'
          }
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          nested: {
            path: '/dev/sdb'
          }
        });
      });

      it('should work on strings', () => {
        chai.expect(utils.hideAbsolutePathsInObject('path /home/john/rpi.img')).to.deep.equal('path rpi.img');
      });

      it('should not alter relative paths', () => {
        const object = {
          path: 'foo/bar'
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          path: 'foo/bar'
        });
      });

      it('should handle arrays', () => {
        chai.expect(utils.hideAbsolutePathsInObject({
          foo: 'foo',
          bar: [
            {
              path: '/foo/bar/baz'
            },
            {
              path: '/foo/bar/baz'
            },
            {
              path: '/foo/bar/baz'
            }
          ]
        })).to.deep.equal({
          foo: 'foo',
          bar: [
            {
              path: 'baz'
            },
            {
              path: 'baz'
            },
            {
              path: 'baz'
            }
          ]
        });
      });
    });

    describe('given Windows paths', () => {
      beforeEach(() => {
        this.isAbsolute = path.isAbsolute;
        this.basename = path.basename;
        path.isAbsolute = path.win32.isAbsolute;
        path.basename = path.win32.basename;
      });

      afterEach(() => {
        path.isAbsolute = this.isAbsolute;
        path.basename = this.basename;
      });

      it('should replace absolute paths with the basename', () => {
        const object = {
          prop1: 'some value',
          prop2: 'C:\\Users\\John\\rpi.img'
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          prop1: 'some value',
          prop2: 'rpi.img'
        });
      });

      it('should replace nested absolute paths with the basename', () => {
        const object = {
          nested: {
            path: 'C:\\Users\\John\\rpi.img'
          }
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          nested: {
            path: 'rpi.img'
          }
        });
      });

      it('should not alter \\\\.\\PHYSICALDRIVE1', () => {
        const object = {
          nested: {
            path: '\\\\.\\PHYSICALDRIVE1'
          }
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          nested: {
            path: '\\\\.\\PHYSICALDRIVE1'
          }
        });
      });

      it('should not alter relative paths', () => {
        const object = {
          path: 'foo\\bar'
        };

        chai.expect(utils.hideAbsolutePathsInObject(object)).to.deep.equal({
          path: 'foo\\bar'
        });
      });

      it('should handle arrays', () => {
        chai.expect(utils.hideAbsolutePathsInObject({
          foo: 'foo',
          bar: [{
            path: 'C:\\foo\\bar\\baz'
          }, {
            path: 'C:\\foo\\bar\\baz'
          }, {
            path: 'C:\\foo\\bar\\baz'
          }]
        })).to.deep.equal({
          foo: 'foo',
          bar: [{
            path: 'baz'
          }, {
            path: 'baz'
          }, {
            path: 'baz'
          }]
        });
      });
    });
  });

  describe('.shouldReport()', () => {
    it('should return true for a string error', () => {
      const error = 'foo';
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for a number 0 error', () => {
      const error = 0;
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for a number 1 error', () => {
      const error = 1;
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for a number -1 error', () => {
      const error = -1;
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for an array error', () => {
      const error = [1, 2, 3];
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for an undefined error', () => {
      const error = undefined;
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for a null error', () => {
      const error = null;
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for an empty object error', () => {
      const error = {};
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for a basic error', () => {
      const error = new Error('foo');
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return true for an error with a report true property', () => {
      const error = new Error('foo');
      error.report = true;
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should return false for an error with a report false property', () => {
      const error = new Error('foo');
      error.report = false;
      chai.expect(utils.shouldReportError(error)).to.be.false;
    });

    it('should return false for an error with a report undefined property', () => {
      const error = new Error('foo');
      error.report = undefined;
      chai.expect(utils.shouldReportError(error)).to.be.false;
    });

    it('should return false for an error with a report null property', () => {
      const error = new Error('foo');
      error.report = null;
      chai.expect(utils.shouldReportError(error)).to.be.false;
    });

    it('should return false for an error with a report 0 property', () => {
      const error = new Error('foo');
      error.report = 0;
      chai.expect(utils.shouldReportError(error)).to.be.false;
    });

    it('should return true for an error with a report 1 property', () => {
      const error = new Error('foo');
      error.report = 1;
      chai.expect(utils.shouldReportError(error)).to.be.true;
    });

    it('should cast the report property to boolean', () => {
      const error = new Error('foo');
      error.report = '';
      chai.expect(utils.shouldReportError(error)).to.be.false;
    });
  });
});

