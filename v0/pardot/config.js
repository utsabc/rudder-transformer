const getEndpoint = (dataCenterId, audienceId) => {
  const mc_api = "api.mailchimp.com";
  const lists_url = `https://${dataCenterId}.${mc_api}/3.0/lists`;
  return `${lists_url}/${audienceId}`;
};

const getLoginEndpoint = () => {
  return `https://pi.pardot.com/${api}/login/version/${apiVersion}`;
};

const getMailEndpoint = () => {
  return `https://pi.pardot.com/api/prospect/version/${api}/do/read/email/`;
};

const opUrl = `https://pi.pardot.com/${api}/${object}/version/${apiVersion}/do/${operation}/${id_field}/${id}`;

const apiVersionList = {
  v3: 3,
  v4: 4
};

const operations = {
  create: "create",
  read: "read",
  query: "query",
  update: "update",
  upsert: "upsert"
};
const destinationConfigKeys = {
  apiVersion: "apiVersion",
  email: "email",
  password: "password",
  accountId: "accountId",
  campaignId: "campaignId",
  userKey: "userKey"
};

module.exports = {
  apiVersionList,
  getLoginEndpoint,
  getMailEndpoint,
  destinationConfigKeys
};
