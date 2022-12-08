import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { wait, wrapPromise } from "../../utils";
import { IntentUtilityContext } from "../../test/common/common-types";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  const wrapper = wrapPromise();
  let receivedContext: IntentUtilityContext;
  await fdc3.addIntentListener("sharedTestingIntent1", (context: IntentUtilityContext) => {
    receivedContext = context;
    wrapper.resolve();
  });

  await wrapper.promise;

  if (receivedContext) {
    await wait(receivedContext.delayBeforeReturn);
    await sendContextToTests(receivedContext);
    if (receivedContext.type === "testContextY") {
      return;
    } else if (receivedContext.type === "testContextX") {
      return receivedContext;
    }
  }

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-b-opened",
  });
});
