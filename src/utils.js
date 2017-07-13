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
_.mixin(require('lodash-deep'));
const flatten = require('flat').flatten;
const deepMapKeys = require('deep-map-keys');
const path = require('path');

/**
 * @summary Prepare object for Mixpanel
 * @function
 * @public
 *
 * @description
 * Flatten object and transform property names to start case.
 * Environment variable like property names are not transformed to start case.
 *
 * @param {*} object to transform
 * @return {*} transformed object
 *
 * @example
 * const object = utils.flattenStartCase({
 *   object: {
 *     propertyName: 'value',
 *     ENVIRONMENT_VARIABLE: true
 *   }
 * });
 *
 * console.log(object);
 * > {
 * >   'Object Property Name': 'value',
 * >   'Object ENVIRONMENT_VARIABLE': true
 * > }
 */
exports.flattenStartCase = (object) => {
  if (_.isUndefined(object)) {
    return undefined;
  }

  // Transform primitives to objects
  if (!_.isObject(object)) {
    return {
      Value: object,
    };
  }

  if (_.isArray(object)) {
    return _.map(object, (property) => {
      if (_.isObject(property)) {
        return exports.flattenStartCase(property);
      }

      return property;
    });
  }

  const transformedKeysObject = deepMapKeys(object, (key) => {
    // Preserve environment variables
    const regex = /^[A-Z_]+$/;
    if (regex.test(key)) {
      return key;
    }

    return _.startCase(key);
  });

  return flatten(transformedKeysObject, {
    delimiter: ' ',
    safe: true,
  });
};

/**
 * @summary Remove paths contained in strings
 * @function
 * @public
 *
 * @param {String} str - string potentially containing paths
 * @returns {String} string with basenamed paths if any
 *
 * @example
 */
exports.basifyContainedPaths = (str) => {
  console.log(__dirname);

  const basify = (pathname) => {

    // Don't alter disk devices, even though they appear as full paths
    if (pathname.startsWith('/dev/') || pathname.startsWith('\\\\.\\')) {
      return pathname;

    } else {
      return path.isAbsolute(pathname) ? path.basename(pathname) : pathname;
    }
  };

  const words = _.split(str, ' ');
  return _.join(_.map(words, (word) => {
    const parenSections = _.split(word, '(');

    if (parenSections.length > 1) {
      return _.join(_.map(parenSections, basify), '(');

    } else {
      return basify(word);
    }
  }), ' ');
};

/**
 * @summary Create an object clone with all absolute paths replaced with the path basename
 * @function
 * @public
 *
 * @param {Object} object - original object
 * @returns {Object} transformed object
 *
 * @example
 * const anonymized = utils.hideAbsolutePathsInObject({
 *   path1: '/home/john/rpi.img',
 *   simpleProperty: null,
 *   nested: {
 *     path2: '/home/john/another-image.img',
 *     path3: 'yet-another-image.img',
 *     otherProperty: false
 *   }
 * });
 *
 * console.log(anonymized);
 * > {
 * >   path1: 'rpi.img',
 * >   simpleProperty: null,
 * >   nested: {
 * >     path2: 'another-image.img',
 * >     path3: 'yet-another-image.img',
 * >     otherProperty: false
 * >   }
 * > }
 */
exports.hideAbsolutePathsInObject = (object) => {
  if (_.isError(object)) {

    // Turn the Error into an Object
    object = _.reduce(Object.getOwnPropertyNames(object), (accumulator, key) => {
      accumulator[key] = object[key];
      return accumulator;
    }, {});
  }

  if (_.isString(object)) {
    return exports.basifyContainedPaths(object);
  }

  return _.deepMapValues(object, (value) => {
    if (!_.isString(value)) {
      return value;
    }

    return exports.basifyContainedPaths(value);
  });
};

/**
 * @summary Check whether an error should be reported to TrackJS
 * @function
 * @public
 *
 * @description
 * In order to determine whether the error should be reported to external services,
 * we check a property called `report`. For backwards compatibility, and
 * to properly handle errors that we don't control, an error without
 * this property is reported automatically.
 *
 * @param {Error} error - error
 * @returns {Boolean} whether the error should be reported
 *
 * @example
 * if (utils.shouldReportError(new Error('foo'))) {
 *   console.log('We should report this error');
 * }
 */
exports.shouldReportError = error => !_.has(error, ['report']) || Boolean(error.report);
