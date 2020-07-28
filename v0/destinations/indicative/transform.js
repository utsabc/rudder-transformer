const _ = require("lodash");
const get = require("get-value");
const set = require("set-value");

const {
    Event,
    TRACK_ENDPOINT,
    IDENTIFY_ENDPOINT,
    ConfigCategory
  } = require("./config");

const { string } = require("is");

const {
    removeUndefinedValues,
    defaultPostRequestConfig,
    defaultRequestConfig,
    getParsedIP
  } = require("../util");
const {
    EventType,
    SpecedTraits,
    TraitsMapping
  } = require("../../../constants");

function responseSimple(message,destination,evType,category) {

    const rawPayload = {};
    let endpoint;
    if(evType==="identify"){
        set(rawPayload, "properties" , message.context);
        endpoint=IDENTIFY_ENDPOINT;
    }else{
        set(rawPayload, "properties", message.properties);
        set(
            rawPayload,
            "properties.user",
            get(message, "context.traits")
          );
        endpoint=TRACK_ENDPOINT;
    }
    rawPayload.eventName=evType;
    if (
        message.userId &&
        message.userId != "" &&
        message.userId != "null" &&
        message.userId != null
      ) {
        rawPayload.uniqueId = message.userId;
      }
      rawPayload.eventUniqueId=message.messageId;
      const payload = removeUndefinedValues(rawPayload);
      const response = defaultRequestConfig();
      response.endpoint = endpoint;
      response.method = defaultPostRequestConfig.requestMethod;
      response.headers = {
        "Content-Type": "application/json"
      };

      //response.uniqueId = message.userId ? message.userId : message.anonymousId;
      response.body.JSON = {
        api_key: destination.Config.apiKey,
        uniqueId: message.userId ? message.userId : message.anonymousId,
        events: payload,
      };
      return response;

    
}

function processSingleMessage(message,destination){
    
    let evType;
    let category = ConfigCategory.DEFAULT;

  const messageType = message.type.toLowerCase();
  switch (messageType) {
    case "identify":
      evType = "identify";
      category = ConfigCategory.IDENTIFY;
      break;
    case "page":
      evType = "pageview";
      category = ConfigCategory.PAGE;
      break;
    case "screen":
      evType = "screenview";
      category = ConfigCategory.SCREEN;
      break;
    case "track":
      evType = message.event;

      switch(evType){
          case Event.REGISTRATION.name:
            category=Event.REGISTRATION.category;
            break;
          case Event.PRODUCT_LIST_VIEWED.name:
              category=Event.PRODUCT_LIST_VIEWED.category;
              break;
          case Event.PRODUCT_LIST_CLICKED.name:
              category=Event.PRODUCT_LIST_CLICKED.category;
              break;
          default:
              category=ConfigCategory.DEFAULT;
              break;
      }
    break;
    default:
      console.log("could not determine type");
      throw new Error("message type not supported");

  }
  return responseSimple(message,destination,evType,category);
  
}


function process(event){
    const respList=[];
    const {message, destination} = event;

    const messageType = message.type.toLowerCase(); //identify
    const eventName = message.event ? message.event : undefined; //registration or undefined

    const tosentEvents=[];

    tosentEvents.push(message);

    for(let i=0;i<tosentEvents.length;i++){
        const result=processSingleMessage(tosentEvents[i],destination);
        if (!result.statusCode) {
            result.statusCode = 200;
          }
        respList.push(result);
    }
      
    return respList;
    throw new Error("Invalid Url in destination");
}

exports.process = process;