# Answers to [Security and Privacy Questionnaire](https://www.w3.org/TR/security-privacy-questionnaire/)

### 2.1 What information might this feature expose to Web sites or other parties, and for what purposes is that exposure necessary?

It exposes content on passive NFC devices (smart cards, tags, etc.) that have
been prepared for sharing (in public).

The API does not explicitly expose whether the device has an NFC adapter (the
reader/writer chip used in phones etc), but that could be determined if NFC
operation returns an error. The following information would be given by error
messages such as “NFC adapter is not present”. Note that this information would
be available only after a user activation and access has been explicitly granted
by the user.

The API currently does **not** list NFC technologies other than NDEF (NFC Data
Exchange Format) standardized by the [NFC Forum](https://nfc-forum.org/).

When writing a tag, the origin of the page is **not** shared by the
implementation, unless shared by the application in a record id, in the payload,
or in an external record type.

### 2.2 Is this specification exposing the minimum amount of information necessary to power the feature?

Yes. Access to NFC is exposing the adapters and the connecting devices (tags,
phones). The amount of exposed information is owned by the connecting devices
and applications.

### 2.3 How does this specification deal with personal information or personally-identifiable information or information derived thereof?

NFC (NDEF) content is controlled by applications, and is like post-it notes or a
piece of paper: everyone can read it, and unless read-only, everyone can
(re-)write it. This is to be kept in mind by the NFC content provider.

Users of this API have access only to the information stored on tags, or which
has been prepared for sharing by the communicating party (taking care of
privacy).

Among the information read, the tag serial number may be used for tracking user
location if the adversary has access to the databases that connect that serial
number with the deployment location. This is not restricted to the tag serial
number, adversary could encode other data for the same purpose, like say
"location: store 34".

When this API is used from a mobile browser, that is within the communication
range (usually 5-10 cm, 2-4 inches) with the communicating party. The user sees
the tag, the terminal, or the other device and potentially its owner.

### 2.4 How does this specification deal with sensitive information?

After user explicitly granted access, Web NFC would **only** expose the
availability of an NFC adapter to the visible document of a top-level browsing
secure context. When listening to NFC content, the serial number and the payload
of a physical NFC device could be used to infer some user information (see
[attacker-model](https://w3c.github.io/web-nfc/#attacker-model)).

For more, see [threats](https://w3c.github.io/web-nfc/#threats) in general and
[fingerprinting and data
collection](https://w3c.github.io/web-nfc/#fingerprinting-and-data-collection)
in particular.
Also,
[security-mechanisms-for-implementations](https://w3c.github.io/web-nfc/#security-mechanisms-for-implementations)
and [security-policies](https://w3c.github.io/web-nfc/#security-policies).

### 2.5 Does this specification introduce new state for an origin that persists across browsing sessions?

No.

### 2.6 What information from the underlying platform, e.g. configuration data, is exposed by this specification to an origin?

The specification doesn’t expose any detail of the underlying platform except
the availability to read and write NFC content, thus the presence of an NFC
adapter. No particular additional information is exposed about the chip, like
features, brand, etc.

### 2.7 Does this specification allow an origin access to sensors on a user’s device?

No.

### 2.8 What data does this specification expose to an origin? Please also document what data is identical to data exposed by other features, in the same or different contexts.

The data read from NFC is exposed. That data is considered either public (NFC
tags/cards), app-controlled (NFC peer/beaming that
the spec does not support at the moment), or private (non-NDEF tech that
the spec does not support at the moment).

### 2.9 Does this specification enable new script execution/loading mechanisms?

No. It is specifically forbidden to implementations to do any automatic actions
(see
[restrict-automatic-handling](https://w3c.github.io/web-nfc/#restrict-automatic-handling)).
Apps may implement automatic handling based on their own permissions (see
[note](https://w3c.github.io/web-nfc/#smart-poster-record)).

### 2.10 Does this specification allow an origin to access other devices?

Other devices are not accessed in any other way than reading or writing content.
If NDEF content is shared via Web NFC, the reading origin does not see the
sharing origin, unless explicitly shared inside the NFC content (as record id or
payload or in an external type name).

### 2.11 Does this specification allow an origin some measure of control over a user agent’s native UI?

No.

### 2.12 What temporary identifiers might this specification create or expose to the web?

None.

### 2.13 How does this specification distinguish between behavior in first-party and third-party contexts?

Web NFC is exposed only to the visible document of a top-level browsing secure
context. Therefore Web NFC can’t be used by third-party resources.

### 2.14 How does this specification work in the context of a user agent’s Private \ Browsing or "incognito" mode?

It will work the same way. During an active "incognito" session, the user agent
may show a prompt for receiving and sending info when users taps their phone on
an NFC device, however, as soon as that session ends, the permission status will
be cleaned.

### 2.15 Does this specification have a "Security Considerations" and "Privacy Considerations" section?

Yes. See the [Security and
Privacy](https://w3c.github.io/web-nfc/#security-and-privacy) section.

### 2.16 Does this specification allow downgrading default security characteristics?

No.

###  2.17. What should this questionnaire have asked?

NFC content can be encrypted and signed, but it’s application domain to manage
the PKI for that. Implementations are not expected to manage private keys for
encryption or signing.
