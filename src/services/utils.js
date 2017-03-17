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

const detect = require('detect-process');

const env = detect.getName();
const browserLike = env === 'browser' || env === 'phantom' || (env === 'electron' && process.type === 'renderer');
const flatten = require('flat').flatten;
const deepMapKeys = require('deep-map-keys');

exports.browserLike = () => browserLike;

/**
 * @summary Prepare object for Mixpanel
 * @function
 * @private
 *
 * @description
 * Flatten object and transform property names to start case.
 * Enviroment variable like property names are not transformed to start case.
 *
 * @param {*} object to transform
 * @return {*} transformed object
 *
 * @example
 * const object = utils.prepareObjectForMixpanel({
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
exports.prepareObjectForMixpanel = (object) => {
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
        return exports.prepareObjectForMixpanel(property);
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
