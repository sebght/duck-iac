import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { tags } from "../../tools/tags";
import * as pulumi from "@pulumi/pulumi";

export class AwsECSRepository {
  private _domain: pulumi.Output<string>;

  public newService(name: string, image: string, port: number, publiclyExposed: boolean): void {
    const cluster = new aws.ecs.Cluster(name + "-cluster", { tags });
    const securityGroup = this.onlyOneIngress(name, port);

    const loadbalancer = new awsx.lb.ApplicationLoadBalancer(name + "-lb", {
      securityGroups: [securityGroup.id],
      tags
    });

    new awsx.ecs.FargateService(name, {
      cluster: cluster.arn,
      assignPublicIp: publiclyExposed,
      taskDefinitionArgs: {
        container: {
          name: name + "-container",
          image,
          cpu: 128,
          memory: 512,
          essential: true,
          portMappings: [
            {
              containerPort: port,
              targetGroup: loadbalancer.defaultTargetGroup
            }
          ],
        },
      },
      tags
    });
    this._domain = pulumi.interpolate`http://${loadbalancer.loadBalancer.dnsName}`
  }

  private onlyOneIngress(serviceName: string, exposedPort: number) {
    const defaultVpc = new awsx.ec2.DefaultVpc("default-vpc");
    return new aws.ec2.SecurityGroup(serviceName + "-lb-sg", {
      vpcId: defaultVpc.vpcId,
      ingress: [
        {
          protocol: "tcp",
          fromPort: exposedPort,
          toPort: exposedPort,
          cidrBlocks: ["0.0.0.0/0"],
        },
      ],
      egress: [
        {
          protocol: "-1",
          fromPort: 0,
          toPort: 0,
          cidrBlocks: ["0.0.0.0/0"],
        },
      ],
      tags
    });
  }

  get domain(): pulumi.Output<string> {
    return this._domain;
  }
}
