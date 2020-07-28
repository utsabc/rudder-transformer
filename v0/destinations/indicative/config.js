const ConfigCategory = {
    IDENTIFY: {
      name: "IndicativeIdentifyConfig"
    },
    PAGE: {
      name: "IndicativePageConfig"
    },
    SCREEN: {
      name: "IndicativeScreenConfig"
    },
    TRACK: {
        name : "IndicativeTrackConfig"
    },
    DEFAULT: {
        name: "AmplitudeDefaultConfig"
      }
}
const Event = {

    REGISTRATION: {
        name: "Registration",
        category: ConfigCategory.TRACK
      },
    PRODUCT_LIST_VIEWED: {
        name: "product list viewed",
        category: ConfigCategory.TRACK
      },

    PRODUCT_LIST_CLICKED: {
        name: "product list clicked",
        category: ConfigCategory.TRACK
      }
    
}
const TRACK_ENDPOINT = "https://api.indicative.com/service/event";
const IDENTIFY_ENDPOINT = "https://api.indicative.com/service/identify";

module.exports = {
    Event,
    TRACK_ENDPOINT,
    IDENTIFY_ENDPOINT,
    ConfigCategory
};
  