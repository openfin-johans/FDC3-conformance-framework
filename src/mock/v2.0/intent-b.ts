import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { wait } from "../../utils";
import { IntentUtilityContext } from "../../test/common/common-types";
declare let fdc3: DesktopAgent;
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  //used in 'RaiseIntentContextResult5secs'
  await fdc3.addIntentListener("sharedTestingIntent1", async (context: IntentUtilityContext) => {
    if (context.delayBeforeReturn > 0) {
      await wait(context.delayBeforeReturn);
    }

    await sendContextToTests({
      type: "sharedTestingIntent1-listener-triggered",
    });

    return context;
  });
});
