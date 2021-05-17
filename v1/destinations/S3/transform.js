import RSDestination from "../../RSClasses/RSDestination";

function process(event) {
  const S3Destination = new RSDestination("S3", event);
  S3Destination.processEvent()
  return event.message;
}

exports.process = process;
