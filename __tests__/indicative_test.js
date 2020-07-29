const integration = "indicative";
const name = "indicative";

const fs= require('fs');
const path= require('path');

const transformer = require(`../v0/destinations/${integration}/transform`);

const inputDataFile = fs.readFileSync(
    path.resolve(__dirname, `./data/${integration}_input.json`)
  );
const outputDataFile = fs.readFileSync(
    path.resolve(__dirname, `./data/${integration}_output.json`)
);
const inputData = JSON.parse(inputDataFile);
const expectedData = JSON.parse(outputDataFile);

for(let i=0;i<inputData.length;i++){
    const ouput=transformer.process(inputData[i]);
    console.log(JSON.stringify(ouput));
}