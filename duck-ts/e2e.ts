import {deployContainer, destroyContainer, getContainerOutputs} from "./duck/container";
import * as superagent from "superagent";
import * as cheerio from "cheerio";
import {expect} from "chai";

const options = {
    cloud: "scw",
    project: "e2e-duck",
    image: "ttl.sh/octo/duck-app:1.0.0",
    port: "80",
    env: "e2e"
}

before(async () => {
    await deployContainer(options);
    await new Promise(resolve => setTimeout(resolve, 10000));
});

after(async () => {
    await destroyContainer(options);
});

describe("Test infrastructure deployment", () => {
    it("should return correct html", async () => {
        await getContainerOutputs(options)
            .then((result) => result.url)
            .then((url) => {
                expect(url).to.be.a("string");
                return superagent.get(url);
            })
            .then((response) => response.text)
            .then((html) => {
                const $ = cheerio.load(html);
                expect($("title").text()).to.equal("Duck Conf");
            });
    });

    it("should return a 200", async () => {
        await getContainerOutputs(options)
            .then((result) => result.url)
            .then((url) => {
                expect(url).to.be.a("string");
                return superagent.get(url);
            })
            .then((response) => response.statusCode)
            .then((statusCode) => {
                expect(statusCode).to.equal(200);
            })
    });
})
