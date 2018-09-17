# rollup-plugin-web-build-events

`rollup-plugin-web-build-events` provides easy to use build-time notifications
from the Rollup ecosystem to power customizable client reload capabilities
— live partial reload, hot reloads, or full page reloads.


## Quick Start

```bash
$ npm install -D rollup-plugin-web-build-events
```

Integrate `rollup-plugin-web-build-events` to your Rollup config.  Then use
modules from `rollup-plugin-web-build-events/esm/browser` to add reloading
capabilities to your development build. You will want to exclude the code from
executing for your production build somehow — e.g. different production and
development builds, use an flag from localStore to turn on debugging, etc.


`some_client_side_source.js`:
```javascript
/* BEGIN DEV ONLY */
// example using [rollup-plugin-strip-code](https://github.com/se-panfilov/rollup-plugin-strip-code#readme) for build variants

import connectReloadEventSource from 'rollup-plugin-web-build-events/esm/browser/sse.js'
connectReloadEventSource()

import reloadDataLive from 'rollup-plugin-web-build-events/esm/browser/dataLive.js'
reloadDataLive()

import reloadReactErrorOverlay from 'rollup-plugin-web-build-events/esm/browser/reactErrorOverlay.js'
reloadReactErrorOverlay(ReactErrorOverlay)

/* END DEV ONLY */
```



## Rollup Plugin Options

```javascript
import rpi_sse_build_events from 'rollup-plugin-web-build-events'

const plugins = [
  rpi_sse_build_events({

    // Base Options:

    ms_build, // default 100ms; milliseconds to debounce and coalesce multiple updates during `rollup` build
    ms_watch, // default 500ms; milliseconds to debounce and coalesce multiple updates during `rollup --watch`

    skip(outputFileName, bndl) {}, // allows excluding some bundles from processing (e.g. code splits)

    contentBase: null, // path that resolved updates are relative to
    onBuildUpdate({updates, mapping, flags, errors}) {}, // callback for each generateBundle processing



    // Server Sent Event Options:

    host, // default '127.0.0.1'
    port, // default 35810

    cert, key, pfx, // TLS options; if present, will be served with 'https' module

    send_initial_update, // default true; sends most recent update to new SSE connections
    silent, // default false; logs to console SSE server connection details
    // all options are passed on to (http || https).createServer
  })
]
```


## API

### Server Sent Events
(see source at [code/server/sse.jsy](https://github.com/shanewholloway/rollup-plugin-web-build-events/blob/master/code/server/sse.jsy) and [code/browser/sse.jsy](https://github.com/shanewholloway/rollup-plugin-web-build-events/blob/master/code/browser/sse.jsy))

in `client-side-script.js`:
```javascript
import connectReloadEventSource from 'rollup-plugin-web-build-events/esm/browser/sse.js'
connectReloadEventSource() // can optionally pass in SSE url; defaults to 'http://127.0.0.1:35810'
```


### Whole Page
(see source at [code/browser/wholePage.jsy](https://github.com/shanewholloway/rollup-plugin-web-build-events/blob/master/code/browser/wholePage.jsy))

`reloadWholePage` is a simpler reloader that will refresh the page for you.

in `client-side-script.js`:
```javascript
import connectReloadEventSource from 'rollup-plugin-web-build-events/esm/browser/sse.js'
connectReloadEventSource()

import reloadWholePage from 'rollup-plugin-web-build-events/esm/browser/wholePage.js'
reloadWholePage()
```



### React Error Overlay
(see source at [code/browser/dataLive.jsy](https://github.com/shanewholloway/rollup-plugin-web-build-events/blob/master/code/browser/reactErrorOverlay.jsy))

`ReactErrorOverlay` from [react-error-overlay](https://www.npmjs.com/package/react-error-overlay)
will show compile errors as well as runtime errors in the browser page.

in `client-side-script.js`:
```javascript
import connectReloadEventSource from 'rollup-plugin-web-build-events/esm/browser/sse.js'
connectReloadEventSource()

import reloadReactErrorOverlay from 'rollup-plugin-web-build-events/esm/browser/reactErrorOverlay.js'
reloadReactErrorOverlay(ReactErrorOverlay)
```


### Data Live
(see source at [code/server/dataLive.jsy](https://github.com/shanewholloway/rollup-plugin-web-build-events/blob/master/code/server/dataLive.jsy) and [code/browser/dataLive.jsy](https://github.com/shanewholloway/rollup-plugin-web-build-events/blob/master/code/browser/dataLive.jsy))

`reloadDataLive` will update DOM nodes with `data-live` attributes when an
update is received, enabling live loading and forming the base of hot-reloading
mechanics. This works particularly well with
[rollup-plugin-hash-n-gzip](https://github.com/shanewholloway/rollup-plugin-hash-n-gzip)
for hash-based cache busting and source integrity calculation.


in `client-side-script.js`:
```javascript
import connectReloadEventSource from 'rollup-plugin-web-build-events/esm/browser/sse.js'
connectReloadEventSource()

import reloadDataLive from 'rollup-plugin-web-build-events/esm/browser/dataLive.js'
reloadDataLive()
```

in `rollup.config.js`:
```javascript
import rpi_hash_n_gzip from 'rollup-plugin-hash-n-gzip'
import rpi_sse_build_events from 'rollup-plugin-web-build-events'
import { datalive_renderHTMLTempalteFile } from 'rollup-plugin-web-build-events/cjs/server/dataLive'

const pi_events = rpi_sse_build_events({onBuildUpdate})

const plugins = [
  pi_events,
  rpi_hash_n_gzip({onBuildUpdate: pi_events}),
]

// …

function onBuildUpdate({mapping}) {
  // This will create `public/index.html` at build time with `data-live` and `data-live-build` 
  // attributes filled in.
  datalive_renderHTMLTempalteFile(mapping, {input: './template/index.html', output: './public/index.html'})
}
```

in `template/index.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    …
    <script data-live-build='src integrity umd/dependencies.js'></script>
    <script data-live='src integrity umd/head.js'></script>
  </head>

  <body>
    …
    <script data-live='src umd/body.js'></script>
  </body>
</html>
```

All `data-live` DOM attributes will be split by whitespace, pulling out
attributes to be updated from the `onBuildUpdate({mapping})` information. The
last entry in the list is the key into the `mapping` hash.

in generated `public/index.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    …
    <script src="umd/dependencies.gxnaCNTZokr9P_90K7aGoMNQYpkke6H03JeZw_aOyC8.js" integrity="sha256-MUIxHcywsSq2mXB7PgimfVEA5s+wB8sWHYcfWzEic4w="></script>
    <script data-live='src integrity umd/head.js' src="umd/head.chMOrZjiCr1B14mzDGM1kFMHnPpYxuNKk1xNwYD1sos.js" integrity="sha256-57T8JPCfhou3hfFFpBnYyYR1iIItQSdH4bl+UpTOr9o="></script>
  </head>

  <body>
    …
    <script data-live='src umd/body.js' src="umd/body.gmHSU2Ako8E_NAIkeD2_5OdEVk4mdgpVqxA5HMYHVJ4.js" ></script>
  </body>
</html>
```


## Combine with Other Rollup Plugins

### [`rollup-plugin-strip-code`](https://www.npmjs.com/package/rollup-plugin-strip-code)

```bash
$ npm install -D rollup-plugin-strip-code
```

in `rollup.config.js`:
```javascript
import rpi_strip_code from 'rollup-plugin-strip-code'

const is_watch = -1 !== process.argv.indexOf('-w') || -1 !== process.argv.indexOf('--watch')
const is_production = (/production/i).test(process.env.NODE_ENV)

const plugins = [
  // …

  is_watch ? null : rpi_strip_code({
    include: 'code/*',
    start_comment: `BEGIN WATCH MODE`,
    end_comment: `END WATCH MODE`,
  }),

  rpi_strip_code({
    include: 'code/*',
    start_comment: `BEGIN ${is_production ? 'DEV' : 'PROD'} ONLY`,
    end_comment: `END ${is_production ? 'DEV' : 'PROD'} ONLY`,
  }),

  // …
]

```



### [`rollup-plugin-replace`](https://www.npmjs.com/package/rollup-plugin-replace)

```bash
$ npm install -D rollup-plugin-replace
```

in `rollup.config.js`:
```javascript
import rpi_replace from 'rollup-plugin-replace'

const is_production = (/production/i).test(process.env.NODE_ENV)

const plugins = [
  // …

  rpi_replace({
    include: 'code/*',
    'process.env.NODE_ENV': JSON.stringify(is_production ? 'production' : 'development'),
  }),

  // …
]
```



## License

[MIT](LICENSE)
