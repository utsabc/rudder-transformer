const _ = require("lodash");
const get = require("get-value");
const set = require("set-value");

const {
    TRACK_ENDPOINT,
    IDENTIFY_ENDPOINT,
    ConfigCategory,
    mappingConfig
  } = require("./config");

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

  // https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/
function stringToHash(string) {
  let hash = 0;
  if (string.length == 0) return hash;
  for (i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return Math.abs(hash);
}
// Get the spec'd traits, for now only address needs treatment as 2 layers.
const populateSpecedTraits = (payload, message) => {
  SpecedTraits.forEach(trait => {
    const mapping = TraitsMapping[trait];
    const keys = Object.keys(mapping);
    keys.forEach(key => {
      set(payload.properties.user_properties,`${key}`, get(message, mapping[key]));
    });
  });
};

//Construct the event payload structure
function responseSimple(message,destination,evType,category,mappingJson){

    const rawPayload={};
    const bodypayload={};

    //construct the payload's basic fields 
    const response = defaultRequestConfig();
    set(bodypayload,"apiKey",destination.Config.apiKey)
    set(bodypayload,"uniqueId",message.userId ? message.userId : message.anonymousId)

    //Construct the basic user properties if the event type is identify
    if(evType=="identify"){
          response.endpoint = IDENTIFY_ENDPOINT;
          set(rawPayload,"properties.user_properties",{});
          populateSpecedTraits(rawPayload, message);
          const traits = Object.keys(message.context.traits);
          traits.forEach(trait => {
            if (!SpecedTraits.includes(trait)) {
              set(
                rawPayload.properties.user_properties,`${trait}`,
                get(message, `context.traits.${trait}`)
              );
            }
          });
     }
     //Construct the basic event properties fileds if the event type is track or page
     else if(evType=="track" || evType=="page"){ 
          response.endpoint = TRACK_ENDPOINT;
          set(rawPayload,"properties.event_properties",{});
          set(bodypayload,"eventName",message.event ? message.event : message.name)
          set(bodypayload,"eventUniqueId",stringToHash(message.messageId))
    }
    //Determine the channel
    if(message.channel == "mobile") {
          set(rawPayload.properties,"device_brand",message.context.device.manufacturer);
    }
    //Construct the payload basic properties based on the category
    const sourceKeys = Object.keys(mappingJson);
    sourceKeys.forEach(sourceKey => {
      set(rawPayload.properties,mappingJson[sourceKey], get(message,sourceKey));
    });

    //Set the user id
    if (message.userId && message.userId != "" && message.userId != "null" && message.userId != null) {
      set(rawPayload, "properties.uniqueId",message.userId);
    }
    //Set the time
    set(rawPayload.properties,"time",stringToHash(message.originalTimestamp));

    //Remove all the undefined fields
    const payload = removeUndefinedValues(rawPayload);

    //Set type of the method [POST, GET]
    response.method = defaultPostRequestConfig.requestMethod;

    //Set the content type inside headers
    response.headers = {
        "Content-Type": "application/json"
    };
    //Set some extra fields based on the event type
    Object.keys(bodypayload).forEach((key,index)=>{
      set(response.body.JSON,key,bodypayload[key]);
    })
    //Set the main payload to the properties
    set(response.body.JSON,"properties",payload.properties);

    return response;
    
}

function processSingleMessage(message,destination){
    
  let evType;
  let category = ConfigCategory.DEFAULT;
  const messageType = message.type.toLowerCase();
  
  //Determine the type of the event
  switch (messageType) {
    case EventType.IDENTIFY:
      evType = "identify";
      category = ConfigCategory.IDENTIFY;
      break;
    case "page":
      evType = "page";
      category = ConfigCategory.PAGE;
      break;
    case "screen":
      evType = "screen";
      category = ConfigCategory.SCREEN;
      break;
    case "track":
      evType = "track";
      category = ConfigCategory.TRACK;
      break;
    default:
      console.log("could not determine type");
      throw new Error("message type not supported");
  }
  return responseSimple(message,destination,evType,category,mappingConfig[category.name]);
}


//process one event at a time
function process(event){

  const {message, destination} = event;
  const messageType = message.type.toLowerCase(); 
  const eventName = message.event ? message.event : undefined; 
  const result=processSingleMessage(message,destination);
  return result;
  throw new Error("Invalid Url in destination");
}

exports.process = process;