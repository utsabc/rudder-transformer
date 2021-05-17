import fs from "fs";

class RSConfig {
  constructor() {
    this.BASE_ENDPOINT = null;
    this.TRACK_ENDPOINT = null;
    this.IDENTIFY_ENDPOINT = null;
    this.GROUP_ENDPOINT = null;
    this.ALIAS_ENDPOINT = null;
  }

  setBaseEndpoint(baseEndpoint) {
    this.BASE_ENDPOINT = baseEndpoint;
  }

  setTrackEndpoint(trackEndpoint) {
    this.TRACK_ENDPOINT = trackEndpoint;
  }

  setIdentifyEndpoint(identifyEndpoint) {
    this.IDENTIFY_ENDPOINT = identifyEndpoint;
  }

  setGroupEndpoint(groupEndpoint) {
    this.GROUP_ENDPOINT = groupEndpoint;
  }

  setAliasEndpoint(aliasEndpoint) {
    this.ALIAS_ENDPOINT = aliasEndpoint;
  }

  getBaseEndpoint() {
    return this.BASE_ENDPOINT;
  }

  getTrackEndpoint() {
    return this.TRACK_ENDPOINT;
  }

  getIdentifyEndpoint() {
    return this.IDENTIFY_ENDPOINT;
  }

  getGroupEndpoint() {
    return this.GROUP_ENDPOINT;
  }

  getAliasEndpoint() {
    return this.ALIAS_ENDPOINT;
  }

  createConfigDataFiles(destName,type){

  }
}
module.exports = RSConfig;

// const { getMappingConfig } = require("../../util");

// const BASE_ENDPOINT = "https://api.indicative.com/service";
// const TRACK_ENDPOINT = `${BASE_ENDPOINT}/event`;
// const IDENTIFY_ENDPOINT = `${BASE_ENDPOINT}/identify`;
// const ALIAS_ENDPOINT = `${BASE_ENDPOINT}/alias`;

// const CONFIG_CATEGORIES = {
//   ALIAS: { endPoint: ALIAS_ENDPOINT, name: "INAliasConfig" },
//   IDENTIFY: { endPoint: IDENTIFY_ENDPOINT, name: "INIdentifyConfig" },
//   PAGE: { endPoint: TRACK_ENDPOINT, name: "INPageConfig" },
//   SCREEN: { endPoint: TRACK_ENDPOINT, name: "INScreenConfig" },
//   TRACK: { endPoint: TRACK_ENDPOINT, name: "INTrackConfig" }
// };

// const MAPPING_CONFIG = getMappingConfig(CONFIG_CATEGORIES, __dirname);
