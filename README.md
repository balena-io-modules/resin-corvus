# resin-corvus
[![npm](https://img.shields.io/npm/v/resin-corvus.svg?style=flat-square)](https://npmjs.com/package/resin-corvus)
[![npm license](https://img.shields.io/npm/l/resin-corvus.svg?style=flat-square)](https://npmjs.com/package/resin-corvus)
[![npm downloads](https://img.shields.io/npm/dm/resin-corvus.svg?style=flat-square)](https://npmjs.com/package/resin-corvus)
[![build status](https://img.shields.io/travis/resin-io-modules/resin-corvus/master.svg?style=flat-square&label=linux)](https://travis-ci.org/resin-io-modules/resin-corvus)
[![build status](https://img.shields.io/appveyor/ci/resin-io/resin-corvus/master.svg?style=flat-square&label=windows)](https://ci.appveyor.com/project/resin-io/resin-corvus)

A wrapper around Sentry and Mixpanel that works in the browser, Node and Electron.

## Setup
Install via npm:
```bash
npm install resin-corvus
```

## Autotracking
Do note with Mixpanel: autotracking is enabled by default. This sends events
such as any mouseclicks regardless. [This can be disabled in the Mixpanel service
itself.](https://mixpanel.com/help/questions/articles/how-do-i-know-what-data-autotrack-is-collecting-and-what-if-im-not-comfortable-with-the-data-being-collected-can-i-turn-off-collection-of-specific-data)
