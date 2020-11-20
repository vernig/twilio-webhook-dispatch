const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 *
 * Create digest to be used in Twilio signature
 *
 * @param {string} authToken - The Twilio auth token
 * @param {string} url - The destination url
 * @param {object} bodyData - Data to be sent in body of the request
 * @returns {string} - Digest (signature)
 */
function createDigest(url, bodyData, authToken) {
  let data = Object.keys(bodyData)
    .sort()
    .reduce((acc, key) => acc + key + bodyData[key], url);

  return crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');
}

/**
 *
 * Encode a json into a urlencoded form
 *
 * @param {string} bodyData - Body data in Json format
 * @returns {string} - urlencoded form
 */

function json2urlencoded(bodyData) {
  return Object.keys(bodyData)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(bodyData[k]))
    .join('&');
}

/**
 *
 * Dispatch single request
 *
 * @param {string} authToken - Twilio auth token
 * @param {string} url - url of the endpoint to dispatch the request to
 * @param {object} bodyData - Data of the body to be sent with the webhook request
 * @returns {Promise<undefined | Error>} - Resolve (with no value) if succesfull
 */
function dispatchRequest(authToken, url, bodyData) {
  options = {
    method: 'POST',
    body: json2urlencoded(bodyData),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-twilio-signature': createDigest(url, bodyData, authToken),
      accept: '*/*',
      'user-agent': 'TwilioProxy/1.1',
    },
  };

  return fetch(url, options)
    .then((res) => {
      if (res.ok) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('Webhook returned error'));
      }
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

/**
 *
 * @param {Object} context - context object passed as first argument to serverless handler
 * @param {Object} event - event object passed as second argument to serverless handler
 * @param {string | Array} destination - URL (or Array of) of the destination
 * @returns{Promise<undefined | Error>} - Resolve (with no value) if succesful
 */

function twilioWebhookDispatch(context, event, destination) {
  if (typeof destination === 'string') {
    destination = [destination];
  }
  return Promise.all(
    destination.map((url) => dispatchRequest(context.AUTH_TOKEN, url, event))
  );
}

module.exports = twilioWebhookDispatch;
