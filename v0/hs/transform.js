const get = require("get-value");
const set = require("set-value");
const axios = require("axios");
const { EventType } = require("../../constants");
const {
  defaultGetRequestConfig,
  defaultPostRequestConfig,
  defaultPutRequestConfig,
  defaultRequestConfig,
  removeUndefinedValues
} = require("../util");
const { ConfigCategory, mappingConfig } = require("./config");

const hSIdentifyConfigJson = mappingConfig[ConfigCategory.IDENTIFY.name];

let hubSpotPropertyMap = {};

function getKey(key) {
  var re = /\s/g;
  return key.toLowerCase().replace(re, "_");
}

async function getProperties(destination, url) {
  if (!hubSpotPropertyMap.length) {
    /* const { apiKey } = destination.Config;
     const url =
      "https://api.hubapi.com/properties/v1/contacts/properties?hapikey=" +
      apiKey; 
    const url = requestUrl + apiKey; */
    const response = await axios.get(url);
    const propertyMap = {};
    response.data.forEach(element => {
      propertyMap[element.name] = element.type;
    });
    hubSpotPropertyMap = propertyMap;
  }
  return hubSpotPropertyMap;
}

async function getTransformedJSON(message, mappingJson, destination) {
  const rawPayload = {};
  let traitsKeys = Object.keys(message.context.traits);
  const { apiKey } = destination.Config;
  let url =
    "https://api.hubapi.com/properties/v1/contacts/properties?hapikey=" +
    apiKey;
  /* const contactUrl =
    "https://api.hubapi.com/properties/v1/contacts/properties?hapikey=" +
    apiKey;
    const companyUrl =
    "https://api.hubapi.com/properties/v1/companies/properties?hapikey=" +
    apiKey; */
  if (message.type == EventType.GROUP) {
    url =
      "https://api.hubapi.com/properties/v1/companies/properties?hapikey=" +
      apiKey;
    traitsKeys = Object.keys(message.traits);
  }
  const propertyMap = await getProperties(destination, url);
  if (mappingJson) {
    const sourceKeys = Object.keys(mappingJson);
    sourceKeys.forEach(sourceKey => {
      if (get(message, sourceKey)) {
        set(rawPayload, mappingJson[sourceKey], get(message, sourceKey));
      }
    });
  }
  traitsKeys.forEach(traitsKey => {
    const hsSupportedKey = getKey(traitsKey);
    if (!rawPayload[traitsKey] && propertyMap[hsSupportedKey]) {
      let propValue =
        message.type == EventType.GROUP
          ? message.traits[traitsKey]
          : message.context.traits[traitsKey];
      if (propertyMap[hsSupportedKey] == "date") {
        var time = propValue;
        var date = new Date(time);
        date.setUTCHours(0, 0, 0, 0);
        propValue = date.getTime();
      }
      rawPayload[hsSupportedKey] = propValue;
    }
  });
  return { ...rawPayload };
}

function getPropertyValueForIdentify(propMap) {
  return Object.keys(propMap).map(key => {
    return { property: key, value: propMap[key] };
  });
}

function responseBuilderSimple(payload, message, eventType, destination) {
  let endpoint = "https://track.hubspot.com/v1/event";
  let params = {};

  const response = defaultRequestConfig();
  response.method = defaultGetRequestConfig.requestMethod;

  if (eventType !== EventType.TRACK) {
    const { email } = message.context.traits;
    const { apiKey } = destination.Config;
    params = { hapikey: apiKey };
    if (email) {
      endpoint =
        "https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/" +
        email;
    } else {
      endpoint = "https://api.hubapi.com/contacts/v1/contact";
    }
    response.method = defaultPostRequestConfig.requestMethod;
    response.body.JSON = removeUndefinedValues(payload);
  } else {
    params = removeUndefinedValues(payload);
  }
  response.endpoint = endpoint;
  response.userId = message.userId ? message.userId : message.anonymousId;
  response.params = params;
  response.statusCode = 200;

  return response;
}

async function processTrack(message, destination) {
  const parameters = {
    _a: destination.Config.hubID,
    _n: message.event
  };

  if (message.properties.revenue || message.properties.value) {
    // eslint-disable-next-line dot-notation
    parameters["_m"] = message.properties.revenue || message.properties.value;
  }
  const userProperties = await getTransformedJSON(
    message,
    hSIdentifyConfigJson,
    destination
  );

  return responseBuilderSimple(
    { ...parameters, ...userProperties },
    message,
    EventType.TRACK,
    destination
  );
}

/* function handleError(message) {
  console.log(message);
  const response = {
    statusCode: 400,
    error: message
  };
  return response;
} */

async function processIdentify(message, destination) {
  if (
    !(message.context && message.context.traits && message.context.traits.email)
  ) {
    // return handleError("Identify without email is not supported.");
    throw new Error("Identify without email is not supported.");
  }
  const userProperties = await getTransformedJSON(
    message,
    hSIdentifyConfigJson,
    destination
  );
  const properties = getPropertyValueForIdentify(userProperties);
  return responseBuilderSimple(
    { properties },
    message,
    EventType.IDENTIFY,
    destination
  );
}

async function getGroupId(message, destination, groupProperties) {
  const website = message.traits.website;
  const { apiKey } = destination.Config;
  const properties = { properties: groupProperties };
  let url =
    "https://api.hubapi.com/companies/v2/domains/" +
    website +
    "/companies?hapikey=" +
    apiKey;
  const companyResponse = await axios.post(url, {
    limit: 100,
    requestOptions: {
      properties: ["domain", "createdate", "name", "hs_lastmodifieddate"]
    },
    offset: {
      isPrimary: true,
      companyId: 0
    }
  });
  if (
    companyResponse.data &&
    companyResponse.data.results &&
    companyResponse.data.results.length > 0
  ) {
    const companyId = companyResponse.data.results[0].companyId;

    url =
      "https://api.hubapi.com/crm/v3/objects/companies/" +
      companyId +
      "?hapikey=" +
      apiKey;
    await axios.patch(url, properties);
    return companyId;
  }
  // const groupProperties = message.traits;
  // const groupProperties = await getTransformedJSON(message, null, destination);

  url = "https://api.hubapi.com/crm/v3/objects/companies?hapikey=" + apiKey;
  let companyCreateResponse;
  await axios.post(url, properties).then(
    response => {
      companyCreateResponse = response;
    },
    error => {
      console.log("========error========");
    }
  );
  if (companyCreateResponse && companyCreateResponse.data) {
    return companyCreateResponse.data.id;
  }
  return null;
}

async function processGroup(message, destination) {
  if (!(message.traits && message.traits.website)) {
    // return handleError("Group without website is not supported.");
    throw new Error("Group without website is not supported.");
  }
  const { apiKey } = destination.Config;
  const groupProperties = await getTransformedJSON(message, null, destination);
  // const properties = getPropertyValueForIdentify(userProperties);
  // console.log(groupProperties);
  const companyId = await getGroupId(message, destination, groupProperties);

  if (companyId == null) {
    // return handleError("Group is not found.");
    throw new Error("Group is not found.");
  }

  const userEmail = message.context.traits.email;
  if (!userEmail) {
    // return handleError("User email is not found.");
    throw new Error("User email is not found.");
  }
  let hsUserId;
  let url =
    "https://api.hubapi.com/contacts/v1/contact/email/" +
    userEmail +
    "/profile?hapikey=" +
    apiKey;
  let userResponse;
  await axios.get(url).then(
    response => {
      userResponse = response;
    },
    error => {
      console.log("========error========");
    }
  );
  if (userResponse && userResponse.data) {
    hsUserId = userResponse.data.vid;
  }
  if (!hsUserId) {
    const userProperties = await getTransformedJSON(
      message,
      hSIdentifyConfigJson,
      destination
    );
    let properties = getPropertyValueForIdentify(userProperties);
    properties = { properties };
    const payload = removeUndefinedValues(properties);
    url =
      "https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/" +
      userEmail +
      "/?hapikey=" +
      apiKey;
    let userCreateResponse;
    await axios.post(url, payload).then(
      response => {
        userCreateResponse = response;
      },
      error => {
        console.log("========error========");
      }
    );
    if (userCreateResponse && userCreateResponse.data) {
      hsUserId = userCreateResponse.data.vid;
    }
    if (!hsUserId) {
      // return handleError("User is not found.");
      throw new Error("User is not found.");
    }
  }
  url =
    "https://api.hubapi.com/companies/v2/companies/" +
    companyId +
    "/contacts/" +
    hsUserId +
    "?hapikey=" +
    apiKey;
  // await axios.put(url);
  const params = {};

  const response = defaultRequestConfig();
  response.method = defaultPutRequestConfig.requestMethod;
  response.endpoint = url;
  response.userId = message.userId ? message.userId : message.anonymousId;
  response.params = params;
  response.statusCode = 200;

  return response;

  /* return responseBuilderSimple(
    { properties },
    message,
    EventType.GROUP,
    destination
  ); */
}

async function processSingleMessage(message, destination) {
  let response;
  switch (message.type) {
    case EventType.TRACK:
      response = await processTrack(message, destination);
      break;
    case EventType.IDENTIFY:
      response = await processIdentify(message, destination);
      break;
    case EventType.GROUP:
      response = await processGroup(message, destination);
      break;
    default:
      console.log("message type " + message.type + " is not supported");
      /* response = {
        statusCode: 400,
        error: "message type " + message.type + " is not supported"
      }; */
      throw new Error("message type not supported");
  }
  return response;
}

async function process(event) {
  const resp = await processSingleMessage(event.message, event.destination);
  if (!resp.statusCode) {
    resp.statusCode = 200;
  }
  // console.log(resp);
  return resp;
}
exports.process = process;
