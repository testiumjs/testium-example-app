# Testium Example App

This application is used to test testium itself.
Changes to this application should be done carefully.
If additional behavior is required, it might be better to add a new file or endpoint than to change an existing one.

* Start on default port (4003): `npm start`
* Start on any port (e.g. 8080): `PORT=8080 npm start`


## Endpoints

### `/echo`

Sends a JSON response with information about the incoming request:

```js
{
  ip, // remote address/ip of the sender
  method, // the http method, e.g. 'GET'
  url, // the request url path, e.g. '/echo?a=42'
  body, // the request body for POST etc.
  headers, // the request headers
}
```


### `/error`

Sends a minimal error page with status code 500.


### `/crash`

Resets the connection without sending a valid response.
Simulates the app crashing.


### `/blackhole`

Never sends a response and keeps the connection open indefinitely.
Useful for testing timeout behavior, making sure the test suite can recover.


### `/blackholed-resource.html`

Simulates a resource required by the page (a script tag) never fully loading,
preventing the page load from finishing.


### `/dynamic.html`

Simulates a page that delays displaying and hiding certain elements,
e.g. because it's waiting for additional data to load.

* `div.load_later`: Shows after 300ms
* `div.load_never`: Is and stays hidden
* `div.hide_later`: Gets hidden after 300ms
* `div.hide_never`: Is and stays visible


### `/index.html`

A relatively complex page:

* Multiple `div.message` elements to verify uniqueness constraints for selectors
* Exactly one `div.only` to have a unique element to select
* `a.link-to-other-page` linking to `/other-page.html`
* A form with various input elements
* A button that triggers log messages
* Different alerts, triggered by links


### `/index-diff.html`

Looks just like `/index.html`, just with slightly different content at the bottom.
Can be used to test visual diffing.


### `/other-page.html`

A mostly empty page that is linked to by `/index.html`.


### `/redirect-after.html`

Uses a `meta` tag to redirect to `/index.html` after a few ms.


### `/redirect-to-query.html`

Just like `/redirect-after.html` but additionally passes two query params:

* `a b`: `A B` - to test encoding of spaces
* `c`: `1,7` - to test url encoding of special characters


### `/windows.html`

For testing popup & iframe related features.

#### `/frame.html`

Displayed as `iframe#cool-frame` and contains `div.in-iframe-only`
and `iframe#nested-frame` (see `/nested-frame.html`).

#### `/nested-frame.html`

This page contains `div#nested-frame-div`.

#### `/popup.html`

Can be opened by clicking on `button#open-popup` and contains `div.popup-only`.

#### `/draggable.html`

Displays a draggable element for testing buttonDown/Up and movePointer...

#### `/pwa.html`

Displays an installable minimal PWA
