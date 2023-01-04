import { assert, expect } from "chai";
import { Channel, Context, DesktopAgent, Listener } from "fdc3_1_2";
import constants from "../../../constants";
import { wait } from "../../../utils";
import { ChannelControl, ChannelsAppConfig, ChannelsAppContext } from "../../common/channel-control";
import { AppControlContext } from "../../common/common-types";

declare let fdc3: DesktopAgent;

export class ChannelControl1_2 implements ChannelControl<Channel, Context, Listener> {
  private readonly testAppChannelName = "test-channel";

  retrieveAndJoinChannel = async (channelNumber: number): Promise<Channel> => {
    const channel = await this.getUserChannel(channelNumber);
    await fdc3.joinChannel(channel.id);
    return channel;
  };

  getSystemChannels = async () => {
    return await fdc3.getSystemChannels();
  };

  leaveChannel = async () => {
    return await fdc3.leaveCurrentChannel();
  };

  getUserChannel = async (channel: number): Promise<Channel> => {
    const channels = await fdc3.getSystemChannels();
    if (channels.length > 0) {
      return channels[channel - 1];
    } else {
      assert.fail("No system channels available for app A");
    }
  };

  joinChannel = async (channel: Channel): Promise<void> => {
    return await fdc3.joinChannel(channel.id);
  };

  createRandomTestChannel = async (): Promise<Channel> => {
    const channelName = `${this.testAppChannelName}.${this.getRandomId()}`;
    return await fdc3.getOrCreateChannel(channelName);
  };

  getCurrentChannel = async (): Promise<Channel> => {
    return await fdc3.getCurrentChannel();
  };

  unsubscribeListeners = async (listeners: Listener[]) => {
    listeners.map((listener) => {
      listener.unsubscribe();
      listener = undefined;
    });
  };

  closeChannelsAppWindow = async (testId: string): Promise<void> => {
    //Tell ChannelsApp to close window
    const appControlChannel = await broadcastAppChannelCloseWindow(testId);

    //Wait for ChannelsApp to respond
    await waitForContext("windowClosed", testId, appControlChannel);
    await wait(constants.WindowCloseWaitTime);
  };

  initCompleteListener = async (testId: string): Promise<AppControlContext> => {
    const receivedContext = await waitForContext("executionComplete", testId, await fdc3.getOrCreateChannel("app-control"));
    return receivedContext;
  };

  openChannelApp = async (testId: string, channelId: string | undefined, commands: string[], historyItems: number = undefined, notify: boolean = true, contextId?: string): Promise<void> => {
    const channelsAppConfig: ChannelsAppConfig = {
      fdc3ApiVersion: "1.2",
      testId: testId,
      channelId: channelId,
      notifyAppAOnCompletion: notify,
      contextId: contextId,
    };

    if (historyItems) {
      channelsAppConfig.historyItems = historyItems;
    }

    //Open ChannelsApp then execute commands in order
    await fdc3.open("ChannelsApp", buildChannelsAppContext(commands, channelsAppConfig));
  };

  setupAndValidateListener = (channel: Channel, listenContextType: string | null, expectedContextType: string | null, errorMessage: string, onComplete: (ctx: Context) => void): Listener => {
    let listener;
    if (channel) {
      console.log("adding addcontextlistener");
      listener = channel.addContextListener(listenContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    } else {
      listener = fdc3.addContextListener(listenContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    }

    validateListenerObject(listener);
    return listener;
  };

  setupContextChecker = async (channel: Channel, requestedContextType: string, expectedContextType: string, errorMessage: string, onComplete: (ctx: Context) => void): Promise<void> => {
    //Retrieve current context from channel
    const context = requestedContextType == undefined ? await channel.getCurrentContext() : await channel.getCurrentContext(requestedContextType);

    expect(context.type).to.be.equals(expectedContextType, errorMessage);
    onComplete(context);
  };

  getRandomId(): string {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];

    return uint32.toString(16);
  }
}

function validateListenerObject(listenerObject) {
  assert.isTrue(typeof listenerObject === "object", "No listener object found");
  expect(typeof listenerObject.unsubscribe).to.be.equals("function", "Listener does not contain an unsubscribe method");
}

const broadcastAppChannelCloseWindow = async (testId: string): Promise<Channel> => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  /* tslint:disable-next-line */
  const closeContext: AppControlContext = {
    type: "closeWindow",
    testId: testId,
  };
  appControlChannel.broadcast(closeContext);
  return appControlChannel;
};

const waitForContext = (contextType: string, testId: string, channel?: Channel): Promise<AppControlContext> => {
  let executionListener: Listener;
  return new Promise<Context>(async (resolve) => {
    console.log(Date.now() + ` Waiting for type: "${contextType}", on channel: "${channel.id}" in test: "${testId}"`);

    const handler = (context: AppControlContext) => {
      if (testId) {
        if (testId == context.testId) {
          console.log(Date.now() + ` Received ${contextType} for test: ${testId}`);
          resolve(context);
          if (executionListener) executionListener.unsubscribe();
        } else {
          console.warn(Date.now() + ` Ignoring "${contextType}" context due to mismatched testId (expected: "${testId}", got "${context.testId}")`);
        }
      } else {
        console.log(Date.now() + ` Received (without testId) "${contextType}" for test: "${testId}"`);
        resolve(context);
        if (executionListener) executionListener.unsubscribe();
      }
    };

    if (channel === undefined) {
      executionListener = fdc3.addContextListener(contextType, handler);
    } else {
      executionListener = channel.addContextListener(contextType, handler);
      //App channels do not auto-broadcast current context when you start listening, so retrieve current context to avoid races
      const ccHandler = async (context: AppControlContext) => {
        if (context) {
          if (testId) {
            if (testId == context?.testId && context?.type == contextType) {
              console.log(Date.now() + ` Received "${contextType}" (from current context) for test: "${testId}"`);
              if (executionListener) executionListener.unsubscribe();
              resolve(context);
            } //do not warn as it will be ignoring mismatches which will be common
            else {
              console.log(
                Date.now() +
                  ` CHecking for current context of type "${contextType}" for test: "${testId}" Current context did ${context ? "" : "NOT "} exist, 
  had testId: "${context?.testId}" (${testId == context?.testId ? "did match" : "did NOT match"}) 
  and type "${context?.type}" (${context?.type == contextType ? "did match" : "did NOT match"})`
              );
            }
          } else {
            console.log(Date.now() + ` Received "${contextType}" (from current context) for an unspecified test`);
            if (executionListener) executionListener.unsubscribe();
            resolve(context);
          }
        }
      };
      channel.getCurrentContext().then(ccHandler);
    }
  });
};

export function buildChannelsAppContext(mockAppCommands: string[], config: ChannelsAppConfig): ChannelsAppContext {
  return {
    type: "channelsAppContext",
    commands: mockAppCommands,
    config: {
      fdc3ApiVersion: config.fdc3ApiVersion,
      testId: config.testId,
      notifyAppAOnCompletion: config.notifyAppAOnCompletion ?? false,
      historyItems: config.historyItems ?? 1,
      channelId: config.channelId,
      contextId: config.contextId,
    },
  };
}
