// import getMappingConfig from "../../v0/util";
import RSResponseBuilder from "./RSResponseBuilder";

class RSDestination {
  constructor(destName, event) {
    this.destName = destName;
    this.event = event;
    this.message = event.message;
    this.destination = event.destination;
    this.Config = this.destination.Config;
  }

  responseBuilder() {
    this.response = new RSResponseBuilder().build();
  }

  processEvent(type) {
    this.type = type;
  }

  //   setConfig(baseEndPoint) {
  //    // const BASE_ENDPOINT = baseEndPoint;
  //     const CONFIG_CATEGORIES = {
  //       ALIAS: { name: `${this.destName}AliasConfig` },
  //       IDENTIFY: { name: `${this.destName}IdentifyConfig` },
  //       PAGE: { name: `${this.destName}PageConfig` },
  //       SCREEN: { name: `${this.destName}ScreenConfig` },
  //       TRACK: { name: `${this.destName}TrackConfig` }
  //     };
  //   //  const MAPPING_CONFIG = getMappingConfig(CONFIG_CATEGORIES, __dirname);
  //   }

  //   processEvent = (type) =>{
  // if (!type) {
  //   throw Error("Message Type is not present. Aborting message.");
  // }
  //     if (type) {
  //       throw Error("Message Type is not present. Aborting message.");
  //     }
  //     const messageType = message.type.toLowerCase();
  //     const formattedMessage = message;
  //     let category;
  //     const respList = [];
  //     switch (messageType) {
  //       case EventType.ALIAS:
  //         category = CONFIG_CATEGORIES.ALIAS;
  //         break;
  //       case EventType.IDENTIFY:
  //         category = CONFIG_CATEGORIES.IDENTIFY;
  //         break;
  //       case EventType.PAGE:
  //         category = CONFIG_CATEGORIES.PAGE;
  //         break;
  //       case EventType.SCREEN:
  //         category = CONFIG_CATEGORIES.SCREEN;
  //         break;
  //       case EventType.TRACK:
  //         category = CONFIG_CATEGORIES.TRACK;
  //         break;
  //       default:
  //         throw new Error("Message type not supported");
  //     }
  //   }
  //  }
}
module.exports = RSDestination;
