import * as gcp from "@pulumi/gcp";

export class GcpCloudRunRepository {
    public newService(name: string, image: string, port: number): gcp.cloudrun.Service {
        return new gcp.cloudrun.Service(name, {
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
    }

    public publiclyExpose(service: gcp.cloudrun.Service) {
        const serviceName = service.name;
        new gcp.cloudrun.IamMember("public-" + serviceName, {
            service: serviceName,
            location: "us-central1",
            role: "roles/run.invoker",
            member: "allUsers",
        });
    }
}
