# twilio-webhook-dispatch

Node packege to be used in Twilio Serverless to dispatch Twilio webhooks to multiple endpoints. It can be used as well to modify the payload before sending it to a Twilio webhook handler. The webhook will be dispatched with a valid `x-twilio-signature` header.

# Install

- Add `twilio-webhook-dispatch` to your Twilio serverless environment

# Usage

## Dispatch your webhook to single destination

```javascript
const TwilioWebhookDispatch = require('twilio-webhook-dispatch');

exports.handler = function (context, event, callback) {
  TwilioWebhookDispatch(context, event, 'https://my.endpoi.nt')
    .then(() => callback(null, response))
    .catch(err, callback(500, null));
};
```

## Dispatch your webhook to multiple destinations

```javascript
const TwilioWebhookDispatch = require('twilio-webhook-dispatch');

exports.handler = function (context, event, callback) {
  TwilioWebhookDispatch(context, event, ['https://my.endpoi.nt/route1', 'https://my.endpoi.nt/route2'])
    .then(() => callback(null, response))
    .catch(err, callback(500, null));
};
```

## Modify your resource before sending it to a Twilio webhook handler

Let's say you want to modify an incoming message before sending it to Twilio Proxy handler (i.e. https://webhooks.twilio.com/v1/Accounts/ACXXX/Proxy/KSXXX/Webhooks/Message):

```javascript
const TwilioWebhookDispatch = require('twilio-webhook-dispatch');

exports.handler = function (context, event, callback) {
  event.body = 'Body has been redacted'
  TwilioWebhookDispatch(context, event, 'https://webhooks.twilio.com/v1/Accounts/ACXXX/Proxy/KSXXX/Webhooks/Message')
    .then(() => callback(null, response))
    .catch(err, callback(500, null));
};
```