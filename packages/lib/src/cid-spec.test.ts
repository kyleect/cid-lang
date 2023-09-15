import { exec } from ".";
import { readFileSync } from "fs";
import { join } from "path";
import { vi } from "vitest";

describe("cid-lang spec", () => {
  it("test.scm should pass", () => {
    const file = readFileSync(join("..", "..", "spec", "test.scm"));
    const fileContents = file.toString();

    const displayStub = vi.fn();

    const env = new Map();
    env.set("display", displayStub);

    const exit = vi.fn();

    exit.mockImplementation((exitCode) => {
      if (exitCode > 0) {
        throw new Error(`test.scm failed ${exitCode} tests`);
      }
    });

    env.set("exit", exit);

    expect(() => exec(fileContents, env)).not.toThrow();
  });
});
