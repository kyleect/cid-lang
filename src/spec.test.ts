import { exec } from ".";
import { readFileSync } from "fs";

describe("spec", () => {
  it.skip("test.scm should pass", () => {
    const file = readFileSync("spec/test.scm");
    const fileContents = file.toString();

    const displayStub = jest.fn();

    const env = new Map();
    env.set("display", displayStub);

    expect(() => exec(fileContents, env)).not.toThrow();
  });
});
