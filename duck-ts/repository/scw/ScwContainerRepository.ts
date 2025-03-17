import * as scw from "@pulumiverse/scaleway";
import {Output} from "@pulumi/pulumi";

export class ScwContainerRepository {
    private _container: scw.Container;

    public newContainer(name: string, image: string, port: number, publiclyExposed: boolean): void {
        const ns = new scw.ContainerNamespace("main", { name });

        this._container = new scw.Container(name, {
            name,
            description: name,
            namespaceId: ns.id,
            registryImage: image,
            port,
            cpuLimit: 140,
            memoryLimit: 256,
            minScale: 3,
            maxScale: 5,
            timeout: 600,
            maxConcurrency: 80,
            privacy: publiclyExposed ? "public" : "private",
            protocol: "http1",
            deploy: true,
        })
    }

    get domain(): Output<string> {
        return this._container.domainName;
    }

    get privacy(): Output<string> {
        return this._container.privacy;
    }
}