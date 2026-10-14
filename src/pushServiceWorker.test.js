import fs from "fs";
import path from "path";
import vm from "vm";

const source = fs.readFileSync(path.join(__dirname, "../public/push-service-worker.js"), "utf8");
test.each([
  ["/notifications", "https://planner.test/notifications"],
  ["https://planner.test/mobile", "https://planner.test/mobile"],
  ["https://attacker.test", "https://planner.test/mobile"],
  ["//attacker.test", "https://planner.test/mobile"],
  ["javascript:alert(1)", "https://planner.test/mobile"],
  ["https://[invalid", "https://planner.test/mobile"],
])("notification clicks constrain %s to the application origin", async (url, expected) => {
  const handlers = {};
  const openWindow = jest.fn();
  const context = { URL, self: { location: { origin: "https://planner.test" }, addEventListener: (name, handler) => { handlers[name] = handler; } }, clients: { matchAll: async () => [], openWindow } };
  vm.runInNewContext(source, context);
  let completion;
  handlers.notificationclick({ notification: { data: { url }, close: jest.fn() }, waitUntil: value => { completion = value; } });
  await completion;
  expect(openWindow).toHaveBeenCalledWith(expected);
});
