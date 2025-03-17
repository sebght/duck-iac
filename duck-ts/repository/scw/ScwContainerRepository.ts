import * as scw from "@pulumiverse/scaleway";
import {Output} from "@pulumi/pulumi";

export class ScwContainerRepository {
    private _container: scw.Container;
    private LEGIT_EXTERNAL_PORTS: number[] = [80, 8080, 5678];

    public newContainer(name: string, image: string, port: number, publiclyExposed: boolean): void {
        if (this.isInvalidImage(image)) {
            throw new Error(`L'image "${image}" est invalide. Vous devez spécifier un tag autre que "latest".`);
        }
        if (this.isInvalidPort(port)) {
            throw new Error(`Le port "${port}" est invalide. Vous devez spécifier un port valide, dans la liste suivante : ${this.LEGIT_EXTERNAL_PORTS}.`);
        }

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

    private isInvalidImage(image: string): boolean {
        return !image.includes(":") || image.endsWith(":latest");
    }

    private isInvalidPort(port: number): boolean {
        return !(this.LEGIT_EXTERNAL_PORTS.includes(port));
    }
}