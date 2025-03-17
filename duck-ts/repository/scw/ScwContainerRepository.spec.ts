import * as pulumi from "@pulumi/pulumi";
import {expect} from "chai";
import {ScwContainerRepository} from "./ScwContainerRepository";
import {promiseOf} from "../../tools/testUtils";

pulumi.runtime.setMocks({
    newResource: (args: pulumi.runtime.MockResourceArgs): { id: string; state: any } => {
        if (args.type === "scaleway:index/containerNamespace:ContainerNamespace") {
            return {id: "mock-namespace-id", state: args.inputs};
        }
        if (args.type === "scaleway:index/container:Container") {
            return {
                id: "mock-container-id",
                state: {...args.inputs, domainName: `https://${args.inputs.name}.example.com`}
            };
        }
        return {id: args.name + "-id", state: args.inputs};
    },
    call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
});

describe("ScwContainerRepository", () => {
    let repo: ScwContainerRepository;

    beforeEach(() => {
        repo = new ScwContainerRepository();
    });

    it("devrait créer un conteneur public", async () => {
        repo.newContainer("my-app", "example-image:v1.0", 8080, true);
        const domain = await promiseOf(repo.domain);
        const privacy = await promiseOf(repo.privacy);

        expect(domain).to.equal("https://my-app.example.com");
        expect(privacy).to.equal("public")
    });

    it("devrait créer un conteneur privé", async () => {
        repo.newContainer("my-private-app", "example-image:v1.0", 8080, false);
        const domain = await promiseOf(repo.domain);
        const privacy = await promiseOf(repo.privacy);

        expect(domain).to.equal("https://my-private-app.example.com");
        expect(privacy).to.equal("private")
    });

    it("retourne une erreur si image a le tag latest", async () => {
        const image = "example-image:latest"
        expect(() => repo.newContainer("invalid-app", image, 8080, true))
            .to.throw(Error, 'L\'image "example-image:latest" est invalide. Vous devez spécifier un tag autre que "latest".');
    });

    it("retourne une erreur si image n'a pas de tag", async () => {
        const image = "example-image"
        expect(() => repo.newContainer("invalid-app", image, 8080, true))
            .to.throw(Error, 'L\'image "example-image" est invalide. Vous devez spécifier un tag autre que "latest".');
    });

    it("retourne une erreur si le port souhaité est invalide", async () => {
        const port = 8085
        expect(() => repo.newContainer("invalid-app", "example-image:v1.0", port, true))
            .to.throw(Error, 'Le port "8085" est invalide. Vous devez spécifier un port valide, dans la liste suivante : 80,8080,5678.');
    });

});
