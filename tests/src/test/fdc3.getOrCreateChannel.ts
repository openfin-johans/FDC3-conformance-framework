import { assert, expect } from "chai";
import APIDocumentation from "../apiDocuments";

const getOrCreateChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.getOrCreateChannel + "\r\nCause";

export default () =>
  describe("fdc3.getOrCreateChannel", () => {
    it("Method is callable", async () => {
      try {
        await window.fdc3.getOrCreateChannel("FDC3Conformance");
      } catch (ex) {
        assert.fail(getOrCreateChannelDocs + (ex.message ?? ex));
      }
    });

    it("Returns Channel object", async () => {
      try {
        const channel = await window.fdc3.getOrCreateChannel("FDC3Conformance");
        expect(channel, getOrCreateChannelDocs).to.have.property("id");
        expect(channel, getOrCreateChannelDocs).to.have.property("type");
        expect(channel, getOrCreateChannelDocs).to.have.property("broadcast");
        expect(channel, getOrCreateChannelDocs).to.have.property(
          "getCurrentContext"
        );
        expect(channel, getOrCreateChannelDocs).to.have.property(
          "addContextListener"
        );
        expect(channel, getOrCreateChannelDocs).to.have.property("type");
      } catch (ex) {
        assert.fail(getOrCreateChannelDocs + (ex.message ?? ex));
      }
    });
  });
