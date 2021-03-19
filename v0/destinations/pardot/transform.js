const { axios } = require("axios");
// const { EventType } = require("../../../constants");
const { identifyConfig, BASE_URL } = require("./config");
const {
  defaultRequestConfig,
  constructPayload,
  defaultPostRequestConfig
} = require("../../util");

const responseBuilderSimple = (payload, destination, accessToken) => {
  const { businessUnitId } = destination.Config;
  const responseBody = { ...payload };
  const response = defaultRequestConfig();
  response.endpoint = `${BASE_URL}${identifyConfig.endpoint}`;
  response.method = defaultPostRequestConfig.requestMethod;
  response.headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${accessToken}`,
    "Pardot-Business-Unit-Id": businessUnitId
  };
  response.body.FORM = responseBody;
  return response;
};

// Consider only Identify call for Pardot for now

const getAccessToken = async destination => {
  const {
    pardotAccountEmail,
    pardotAccountPassword,
    salesforceSecurityToken
  } = destination.Config;

  const authResponse = await axios.post(
    "https://login.salesforce.com//api/login/version/4",
    {
      username: pardotAccountEmail,
      password: `${pardotAccountPassword}${salesforceSecurityToken}`,
      clientId: "",
      clientSecret: "",
      grantType: "password"
    }
  );
  return authResponse.access_token;
};

const processIdentify = (message, destination) => {
  const accessToken = getAccessToken(destination);
  if (!accessToken) {
    throw new Error(" authentication fail");
  }
  const prospectObject = constructPayload(message, identifyConfig.name);
  return responseBuilderSimple(prospectObject, destination, accessToken);
};

const processEvent = (message, destination) => {
  let response;
  if (!message.type) {
    throw new Error("Message Type is not present. Aborting message.");
  }
  if (message.type === "identify") {
    response = processIdentify(message, destination);
  }
  return response;
};

const process = event => {
  return processEvent(event.message, event.destination);
};

exports.process = process;
