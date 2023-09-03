import { exec } from ".";

describe.skip("exec", () => {
  it("should work with default environment", () => {
    expect(exec("(+ 1 2)")).toBe("3");
  });

  it("should work with custom environment", () => {
    const env = new Map<string, unknown>();

    env.set("a", 1000);

    expect(exec("(+ 1 a)", env)).toBe("1001");
  });
});
