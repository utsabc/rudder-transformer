/**
 * perform complete sanity check, npm test __tests__/destinations.test.js
 * 
 * perform sanity check for a single destination, npm test __tests__/destinations.test.js dest=<destination_folder>
 * e.g. npm test __tests__/destinations.test.js dest=adj, sanity check for adjust only.
 */

const path = require('path');
const fs = require('fs');
const version = "v0";

//resolve path of destinations directory
const _destination = process.argv[7] ? process.argv[7].replace("dest=", "") : null; 
const destinations = _destination ? [_destination] : fs.readdirSync(path.resolve(`../rudder-transformer/${version}/destinations`));

// prepare input data
const inputDataFile = fs.readFileSync(path.resolve(__dirname, `./data/destinations/input_data.json`));
const inputData = JSON.parse(inputDataFile);

// prepare config data
const configDataFile = fs.readFileSync(path.resolve(__dirname, `./data/destinations/config_data.json`));
const configData = JSON.parse(configDataFile);

destinations.forEach(function (destination) {
  const destinationPath = fs.statSync(path.resolve(`../rudder-transformer/${version}/destinations/${destination}`));

  if( destinationPath.isDirectory() ) {
    const hasOutput = fs.existsSync(path.resolve(__dirname, `./data/destinations/${destination}_output.json`));
    const hasTransformer = fs.existsSync(path.resolve(`../rudder-transformer/${version}/destinations/${destination}/transform.js`));
    
    if (hasTransformer && hasOutput) {
      const transformer = require(`../${version}/destinations/${destination}/transform`);

      // prepare output data
      const outputDataFile = fs.readFileSync(path.resolve(__dirname, `./data/destinations/${destination}_output.json`));
      const outputData = JSON.parse(outputDataFile);
      inputData.forEach((input, index) => {
        it(`${destination} - payload: ${index}`, async () => {
          try {
            const output = await transformer.process({
              "destination": configData[destination],
              "message": input
            });
            expect(output).toEqual(outputData[index]);
          } catch (error) {
            expect(error.message).toEqual(outputData[index].error);
          }
        });
      });
    }
  }
});