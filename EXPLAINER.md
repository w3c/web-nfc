# Web NFC explained

Authors:
- Kenneth Christiansen
- Zoltan Kis
- Francois Beaufort

Participate
- https://github.com/w3c/web-nfc/issues/
- https://lists.w3.org/Archives/Public/public-web-nfc/

## Introduction

Web NFC aims to provide sites the ability to read and write to nearby NFC (Near
Field Communication) tags in a secure and privacy preserving manner.

NFC consists of a rather large set of technologies, so for this first iteration
of the API the focus has been on supporting the NFC Data Exchange Format aka
[NDEF](https://www.oreilly.com/library/view/beginning-nfc/9781449324094/ch04.html),
a lightweight binary message format, as it works across different tag formats.

Web NFC is only available to top-level, secure browsing contexts, and origins
must first request the “nfc” permission while handling a user gesture. To then
perform a read or write, the web page must be visible when the user touches an
NFC tag with their device. The browser uses haptic feedback to indicate a tap.
Access to the NFC radio is blocked if the display is off or the device is
locked. For backgrounded web pages, receiving and pushing NFC content are
suspended.

We believe Web NFC is an easy to use API that web developers will be comfortable
with, and at the same time that it is low-level and flexible enough so that
users can get the full potential out of NDEF and even integrate with legacy
solutions.

## Goals

Read, lock, and write to NFC tags/cards using the NDEF standards, in an easy
webby manner, while being flexible enough to integrate easily with existing NDEF
based solutions.

Make sure the API is extendable to cover more NFC use-cases, like non-NDEF, in
the future.

## Non-goals

In this version of the API, proprietary NFC technologies used in hotel keys,
e-passports etc are not supported. Automatic handling of NFC content, such as
opening or saving files, making calls or saving contacts (with “smart posters”),
or joining WiFi or Bluetooth networks (NFC handover) is not supported.

NFC (with NDEF) is not secure for authenticity or integrity. NDEF tags are like
post-it notes, anyone can read them, and unless read-only, anyone can write
them. Web NFC does not handle automatic encryption or signing of NFC content
(with NDEF signatures): handling PKI infrastructure is left to applications.

## API shape and examples

The API has gone through multiple iterations and have had feedback from Mozilla,
Google as well as web developers.

The API is modern and follows other hardware connectivity APIs in the use of
DataView to expose data.

The full API can be seen here: https://w3c.github.io/web-nfc/#idl-index

Lots of examples can be found here: https://w3c.github.io/web-nfc/#examples

## Key scenarios

Among different use-cases, NFC allows users to take their NFC enabled device
such as a phone and touch NFC tags (sticker, card and the like). The platform,
or a certain application can then at this moment read the content, write new
content back, and make NFC tag permanently read-only.

Web NFC allows to build web experiences that can do the above, thus exchange
data between the web enabled device and NFC tags.

Data read from NFC tags can come from unknown sources and thus should be
treated like that by web developers. This is no different than treating
user input and data such as JSON, fetched from a remote server.

The NDEF signature records, gives the web site the possibility of verifying
the authenticity and integrity of data within the NDEF message and only deal
with data it trusts.

Additionally, Web NFC integrates well with other existing APIs:

### Integration with Permissions API
The close integration with the [Permissions
API](https://www.w3.org/TR/permissions/) allows web developers to prompt users,
when required, about granting access to Web NFC. It means sending and receiving
info when users tap NFC devices can be done smoothly once permission is granted.

```js
const ndef = new NDEFReader();

async function startScanning() {
  await ndef.scan();
  ndef.onreading = event => {
    /* handle NDEF messages */
  };
}

const nfcPermissionStatus = await navigator.permissions.query({ name: "nfc" });
if (nfcPermissionStatus.state === "granted") {
  // NFC access was previously granted, so we can start NFC scanning now.
  startScanning();
} else {
  // Show a "scan" button.
  document.querySelector("button").style.display = "block";
  document.querySelector("button").onclick = event => {
    // Prompt user to allow UA to send and receive info when they tap NFC devices.
    startScanning();
  };
}
```

### Integration with TextEncoder/Decoder and DataView

Web NFC is following the spirit of other hardware communication APIs like [Web
Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) and [Web
USB](https://wicg.github.io/webusb/) in that it offers secure low level access
with no magic and instead exposes data as a DataView as well as requires text to
be encoded and decoded using TextEncoder/TextDecoder, which allows handling
cases where the text might even be in UTF-16 do to existing real life
implementations.

```js
const ndef = new NDEFReader();

await ndef.scan();
ndef.onreading = event => {
  const externalRecord = event.message.records.find(
    record => record.type == "example.com:smart-poster"
  );

  let action, text;

  for (const record of externalRecord.toRecords()) {
    if (record.recordType == "text") {
      const decoder = new TextDecoder(record.encoding);
      text = decoder.decode(record.data);
    } else if (record.recordType == "act") {
      action = record.data.getUint8(0);
    }
  }

  console.log({text, action});
};
```

### Integration with AbortController

Using the
[AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
primitive allows web developers to easily abort NFC operations and other
operations that use it. It makes it easy to cancel multiple things, especially
when switching views in a single-page application for instance.

```js
const abortController = new AbortController();
abortController.signal.onabort = event => {
  // All NFC operations have been aborted.
};

const ndef = new NDEFReader();
await ndef.scan({ signal: abortController.signal });

await ndef.write("foo", { signal: abortController.signal });
await ndef.makeReadOnly({ signal: abortController.signal });

document.querySelector("#abortButton").onclick = event => {
  abortController.abort();
};
```

## Integration with Page Visibility

Web NFC functionality is allowed only for the document of the top-level browsing
context, which must be visible. Thanks to the
[Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API),
web developers can track when it document visibility changes.

```js
document.onvisibilitychange = event => {
  if (document.hidden) {
    // All NFC operations are automatically suspended when document is hidden.
  } else {
    // All NFC operations are resumed, if needed.
  }
};
```

## Detailed design discussion

### Low level API vs standardized NDEF records only
NDEF (NFC Data Exchange Format) comes with a set of standard records with
data encoded in particular ways, like text which also encode the encoding
and language name, and even smart-poster, which can contain icons and
descriptions in multiple languages.

It would have been possible to just expose these as separate objects, each with
a set of properties. That would solve the common go-to examples for NFC, but it
would also be limiting as it would be impossible (at least without an additional
API) to read and create custom or slightly different records.

This was attempted in an earlier effort to add NFC support to the web platform:
https://www.w3.org/2012/nfc/web-api/#ndefrecordsmartposter-interface

The common records, though often used for illustration, are not that popular and
the power really lies in being able to store your own data in the most efficient
way, as well as being able to interact with existing solutions deployed in the
wild.

Instead of having two sets of APIs, we decided that it was best to offer a more
low-level API that is still easy to use for simple cases like the standardized
NDEF records.

### Separate objects vs navigator.nfc

Other connectivity APIs currently rely on attaching themselves to the navigator
object/namespace, like Web Bluetooth, Web USB, etc. Unlike these APIs, the newer
Generic Sensor APIs don’t attach themselves to the navigator object/namespace
and have separate and dedicated objects like Accelerometer, Gyroscope, etc.

We decided to follow this newer pattern as it allows node.js to implement the
same API, and have it loaded as a separate module. People working on Web
Assembly are also advocating for this patterns as it might be able to turn such
globals into modules in the future, at least when accessed from WASM.

### Common vs separate objects for reader/writer

The reader and writer objects existed separately when scan filters were supported,
but after filters have been abandoned, they have been merged into one single object.

## Considered alternatives

### Restrict to NDEF and name accordingly

As an example, initially we used names like NFCReader and added required reading
APIs. In order to add additional APIs for alternative NFC technologies (say
NFC-A), adding these to the reader object could make it less straightforward to
use for users and may result in currently API design that later if found out to
be insufficient for the future additions.

Some native APIs have added all functionality to the same objects, but other
APIs have separated NDEF from other tag technologies and we have decided that
that leads to the easiest to understand API, as well as minimizes the risk of
running into API issues when extending the API in the future.

## Stakeholder Feedback / Opposition

- Chrome: Positive (part of Project Fugu)
- Firefox: Positive in the FirefoxOS days, since then, no signals
- Safari: Negative
- Edge: No signals

From speaking about the feature at multiple events over the years, it is clear
that web developers have been quite positive about the ability to use NFC from
the web.

## Changes done after Origin Trial (OT)

### Removed NDEF scan option for filtering

The OT feedback was the filtering feature was not needed very much, and applications
can easily implement it.

### Merged NDEFWriter into NDEFReader

Once scan filtering was removed, there was no point in keeping separate objects
for reading and writing NDEF tags. Hence `NDEFWriter.write` became
`NDEFReader.write`.

### Removed NDEF write option for ignoring read

When a tag is written, it is also read. With merging the reading and writing
objects, this option became unneeded. There is an [example](https://w3c.github.io/web-nfc/#handling-initial-reads-while-writing) included on how to ignore reads when writing.

### Replaced `onerror` with `onreadingerror`

Since the merge of `NDEFWriter` and `NDEFReader`, the former `onerror` event on
`NDEFReader` still relates to scans, but it could be interpreted to be also
relevant on writes, which is not the case. This change clarifies the error is
only relevant for scans.


These changes mark the [Chrome Origin Trial](https://developers.chrome.com/origintrials/#/view_trial/236438980436951041) complete.

## References & acknowledgements

Thanks to Jeffrey Yasskin, Anne van Kesteren, Anssi Kostiainen, Domenic
Denicola, Daniel Ehrenberg, Jonas Sicking, Don Coleman, Salvatore Iovene,
Rijubrata Bhaumik, Elena Reshetova, Wanming Lin and Han Leon for their
contributions.
