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
const flatten = require('flat').flatten;
const deepMapKeys = require('deep-map-keys');

exports.transformForMixpanel = (object) => {
  if (_.isUndefined(object)) {
    return object;
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
        return exports.transformForMixpanel(property);
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

