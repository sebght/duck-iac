import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { tags } from "../../tools/tags";
import * as pulumi from "@pulumi/pulumi";

export class AwsECSRepository {

  public simple(image: string, exposePubliquement: boolean): pulumi.Output<string> {
    const cluster = new aws.ecs.Cluster("duck-app-cluster", { tags });
    const securityGroup = this.sgUniquementIngress80();

    const loadbalancer = new awsx.lb.ApplicationLoadBalancer("duck-app-lb", {
      securityGroups: [securityGroup.id],
      tags
    });

    new awsx.ecs.FargateService("duck-app", {
      cluster: cluster.arn,
      assignPublicIp: exposePubliquement,
      taskDefinitionArgs: {
        container: {
          name: "service-container",
          image,
          cpu: 128,
          memory: 512,
          essential: true,
          portMappings: [
            {
              containerPort: 80,
              targetGroup: loadbalancer.defaultTargetGroup
            }
          ],
        },
      },
      tags
    });
    return pulumi.interpolate`http://${loadbalancer.loadBalancer.dnsName}`
  }

  private sgUniquementIngress80() {
    const vpc = new awsx.ec2.DefaultVpc("default-vpc");
    return new aws.ec2.SecurityGroup("duck-app-lb-sg", {
      vpcId: vpc.vpcId,
      ingress: [
        {
          protocol: "tcp",
          fromPort: 80,
          toPort: 80,
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
}
