const integration = "mailchimp";
const name = "Mailchimp";

const fs = require("fs");
const path = require("path");

const transformer = require(`../v0/destinations/${integration}/transform`);
// const { compareJSON } = require("./util");

test(`${name} Tests`, async () => {
  const inputDataFile = fs.readFileSync(
    path.resolve(__dirname, `./data/${integration}_input.json`)
  );
  const outputDataFile = fs.readFileSync(
    path.resolve(__dirname, `./data/${integration}_output.json`)
  );
  const inputData = JSON.parse(inputDataFile);
  const expectedData = JSON.parse(outputDataFile);
  // await Promise.all(
    inputData.foreach(input, index) => {
      const output = await transformer.process(input);
      console.log("index:: "+index);
      console.log("output::"+JSON.stringify(output));
      console.log("ecpected::"+JSON.stringify(expectedData[index]));
      expect(output).toEqual(expectedData[index]);
      console.log("indexedDone::"+index);
    });
  // );
});
