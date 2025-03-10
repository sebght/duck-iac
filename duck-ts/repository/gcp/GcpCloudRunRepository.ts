import * as gcp from "@pulumi/gcp";
import { Output } from "@pulumi/pulumi";

export class GcpCloudRunRepository {
    private _domain: Output<string>;

    public newService(name: string, image: string, port: number, publiclyExposed: boolean): void {
        const service = new gcp.cloudrun.Service(name, {
            location: "us-central1",
            template: {
                spec: {
                    containers: [{
                        image,
                        resources: {
                            limits: {
                                memory: "1Gi",
                            },
                        },
                        ports: [
                            {
                                containerPort: port,
                            },
                        ],
                    }],
                    containerConcurrency: 50,
                },
            },
        })
        this._domain = service.statuses[0].url
        if (publiclyExposed) {
            this.publiclyExpose(service)
        }
    }

    private publiclyExpose(service: gcp.cloudrun.Service) {
        const serviceName = service.name;
        new gcp.cloudrun.IamMember("public-" + serviceName, {
            service: serviceName,
            location: "us-central1",
            role: "roles/run.invoker",
            member: "allUsers",
        });
    }

    get domain(): Output<string> {
        return this._domain;
    }
}
