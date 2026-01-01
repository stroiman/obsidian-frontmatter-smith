import {
  createDefaultCommandByType,
  migrateCommandToType,
} from "../../src/configuration-editor/defaults";

describe("migrateCommandToType", () => {
  it("Keeps key and value", () => {
    const command = createDefaultCommandByType("add-array-element");
    command.key = "some-key";
    command.value = {
      $type: "constant",
      value: "some-value",
    };
    const migrated = migrateCommandToType(command, "set-value");
    migrated.should.haveOwnProperty("key").equal("some-key");
    migrated.should.haveOwnProperty("value").like({
      $type: "constant",
      value: "some-value",
    });
  });
});
