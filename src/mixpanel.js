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

const detect = require('detect-process')
const utils = require('./utils')
const defaultContext = require('./default-context')
const _ = require('lodash')

module.exports = (MixpanelLib) => {
  const env = detect.getName()

  const properties = {
    installed: false,
    projectToken: null
  }

  const isInstalled = () => properties.installed

  return {
    /**
     * @summary Is Mixpanel installed?
     * @function
     * @public
     *
     * @returns {Boolean} Whether Mixpanel is installed
     *
     * @example
     * if (mixpanel.isInstalled()) {
     *   console.log('Mixpanel is installed');
     * }
     */
    isInstalled,

    /**
     * @summary Install Mixpanel client
     * @function
     * @public
     *
     * @param {String} token
     * @param {Object} config
     *
     * @example
     * mixpanel.install('YOUR_TOKEN', {
     *   version: '1.0.0'
     * });
     */
    install: (token, context, config) => {
      if (isInstalled()) {
        throw new Error('Mixpanel already installed')
      }

      // This is a hack to prevent Mixpanel from sending a strange `/decide/` HTTP request.
      // We don't know what `/decide/` is for, but by taking a look at the `mixpanel` browser
      // library, we determined that we can prevent that call with the following incantation:
      if (global.window) {
        global.window['_mpEditorLoaded'] = true
        global.window.sessionStorage.setItem('editorParams', JSON.stringify({
          projectToken: token
        }))
      }

      properties.projectToken = token
      properties.context = utils.flattenStartCase(_.defaults(context, defaultContext[env]))
      properties.installed = true
      properties.config = config
    },

    /**
     * @summary Uninstall Sentry client
     * @function
     * @public
     *
     * @example
     * sentry.uninstall()
     */
    uninstall: () => {
      if (!isInstalled()) {
        throw new Error('Mixpanel not installed')
      }

      properties.installed = false
    },

    /**
     * @summary Track message in Mixpanel
     * @function
     * @public
     *
     * @param {String} message
     * @param {Object} data
     */
    track: (message, data) => {
      if (!isInstalled()) {
        throw new Error('Mixpanel not installed')
      }

      const context = Object.assign({}, properties.context, utils.flattenStartCase(data))

      if (!properties.client) {
        properties.client = MixpanelLib.init(properties.projectToken, properties.config) || MixpanelLib
      }

      properties.client.track(message, utils.hideAbsolutePathsInObject(context))
    }
  }
}
