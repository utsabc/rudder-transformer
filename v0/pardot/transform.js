const get = require("get-value");
const axios = require("axios");
const set = require("set-value");
const { EventType } = require("../../constants");
let {
  destinationConfigKeys,
  getLoginEndpoint,
  getMailEndpoint,
  apiVersionList
} = require("./config");
let apiVersion;
let email;
let password;
let accountId;
let campaignId;
let userKey;
let apiKey;

const {
  defaultPostRequestConfig,
  defaultPutRequestConfig,
  defaultGetRequestConfig
} = require("../util");

async function login() {
  const payload = {
    email,
    password,
    user_key: userKey,
    format: "json"
  };
  const url = getLoginEndpoint(api, apiVersion);
  const response = await axios.post(url, payload);
  if (get(response, "api_key")) {
    apiKey = response.api_key;
    return true;
  }
  return false;
}

async function checkIfMailExists(email) {
  const url = getMailEndpoint(api, apiVersion);
  // Verify authorization
  const response = await axios.get(url, {
    auth: {
      username: "apiKey",
      password: `${apiKey}`
    }
  });
  let check = false;
  response.data.members.forEach(member => {
    if (member.email_address === email) {
      check = true;
    }
  });
  return check;
}

async function responseBuilderSimple(payload, message, eventType, destination) {
  // TODO
  let endpoint;
  let requestConfig;
  const email = message.context.traits.email;
  const emailExists = await checkIfMailExists(email);

  if (emailExists) {
    if (mergeFields) {
      endpoint = getCustomMergeFieldsUrl();
      requestConfig = defaultPostRequestConfig;
    } else if (updateSubscription) {
      endpoint = getUpdateUserTraitsUrl(email);
      requestConfig = defaultPutRequestConfig;
    }
  } else {
    endpoint = getSubscribeUserUrl();
    requestConfig = defaultPostRequestConfig;
  }
  let basicAuth = new Buffer("apiKey" + ":" + `${apiKey}`).toString("base64");
  const response = {
    endpoint,
    header: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`
    },
    requestConfig,
    userId: message.userId ? message.userId : message.anonymousId,
    payload
  };

  return response;
}

function getPayload(emailExists) {
  // TODO
  let rawPayload = {};
  switch (apiVersion) {
    case apiVersionList.v3:
      break;
    case apiVersionList.v4:
      break;
    default:
      break;
  }
  return rawPayload;
}

async function getTransformedJSON(message) {
  // TODO
  const loggedIn = await login();
  if (!loggedIn) {
    return;
  }

  let traits, userId, integrations;
  const traitsExist = get(message, "context.traits.traits");
  if (traitsExist) {
    traits = get(message, "context.traits.traits");
    userId = get(message, "context.traits.userId");
    integrations = get(message, "context.traits.integrations");
  } else {
    traits = get(message, "context.traits");
  }

  const emailExists = await checkIfMailExists(message.context.traits.email);

  if (modifyAudienceId) {
    modifyAudienceId ? (audienceId = message.context.MailChimp.listId) : null;
  }

  const rawPayload = getPayload(
    emailExists,
    customMergeFields,
    traits,
    updateSubscription,
    message
  );

  return { ...rawPayload };
}

function setDestinationKeys(destination) {
  // Sets all the required keys for this destination to global variables.
  const keys = Object.keys(destination.Config);
  keys.forEach(key => {
    switch (key) {
      case destinationConfigKeys.apiVersion:
        apiVersion = `${destination.Config[key]}`;
        break;
      case destinationConfigKeys.email:
        email = `${destination.Config[key]}`;
        break;
      case destinationConfigKeys.password:
        password = `${destination.Config[key]}`;
        break;
      case destinationConfigKeys.accountId:
        accountId = `${destination.Config[key]}`;
        break;
      case destinationConfigKeys.campaignId:
        campaignId = `${destination.Config[key]}`;
        break;
      case destinationConfigKeys.userKey:
        userKey = `${destination.Config[key]}`;
        break;
      default:
        break;
    }
  });
}

async function processIdentify(message, destination) {
  setDestinationKeys(destination);
  const properties = await getTransformedJSON(message);
  return responseBuilderSimple(
    properties,
    message,
    EventType.IDENTIFY,
    destination
  );
}

async function processSingleMessage(message, destination) {
  let response;
  if (message.type === EventType.IDENTIFY) {
    response = await processIdentify(message, destination);
  } else {
    response = {
      statusCode: 400,
      error: "message type " + message.type + " is not supported"
    };
  }
  return response;
}

async function process(events) {
  let respList = [];
  respList = await Promise.all(
    events.map(event => processSingleMessage(event.message, event.destination))
  );
  return respList;
}

exports.process = process;

// analytics.identify({
//   userId: 'YOUR_DATABASE_USER_ID',
//   traits: {
//       email: 'bill@segment.com'
//   },
//   integrations: {
//       Pardot: {
//           fid: '00339000033ZUR6'
//       }
//   }
// });

// analytics.identify({
//   userId: 'YOUR_DATABASE_USER_ID',
//   traits: {
//       email: 'bill@segment.com',
//       org_id: '1sf324fd53'
//   }
// });
