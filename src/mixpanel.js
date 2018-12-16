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
  const queue = []

  let installed = false
  let projectToken = null
  let client = null
  let mixpanelContext = {}
  let disabled = false

  function disposeEventsQueue () {
    if (client === null) {
      return
    }

    let element = queue.shift()
    while (element !== undefined) {
      const { event, data } = element
      client.track(event, data)
      element = queue.shift()
    }
  }

  function setConfig (config) {
    if (config == null) {
      disabled = true
      queue.splice(0, queue.length)
    } else {
      client = MixpanelLib.init(projectToken, config) || MixpanelLib
    }
  }

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
    isInstalled: () => {
      return installed
    },

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
    install: (token, context, config, deferred = false) => {
      if (installed) {
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

      projectToken = token
      mixpanelContext = utils.flattenStartCase(_.defaults(context, defaultContext[env]))
      installed = true
      // deferred means that setConfig will be called later
      if (!deferred) {
        setConfig(config)
      }
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
      if (!installed) {
        throw new Error('Mixpanel not installed')
      }

      installed = false
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
      if (!installed) {
        throw new Error('Mixpanel not installed')
      }

      if (disabled) {
        return
      }

      // Store the event until configs are loaded
      queue.push({
        event: message,
        data: utils.hideAbsolutePathsInObject(Object.assign({}, mixpanelContext, utils.flattenStartCase(data)))
      })

      // Dispatch events if there are any stored
      disposeEventsQueue()
    },

    setConfig
  }
}
