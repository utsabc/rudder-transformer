const { getMappingConfig } = require("../util");

const ConfigCategory = {
    IDENTIFY: {
      name: "IndicativeIdentifyConfig"
    },
    PAGE: {
      name: "IndicativePageConfig"
    },
    TRACK: {
        name : "IndicativeTrackConfig"
    },
    DEFAULT: {
        name: "IndicativeDefaultConfig"
    }
};
const TRACK_ENDPOINT = "https://api.indicative.com/service/event";
const IDENTIFY_ENDPOINT = "https://api.indicative.com/service/identify";

const mappingConfig = getMappingConfig(ConfigCategory, __dirname);

module.exports = {
    TRACK_ENDPOINT,
    IDENTIFY_ENDPOINT,
    ConfigCategory,
    mappingConfig
};
  