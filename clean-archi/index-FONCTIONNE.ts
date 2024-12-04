import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import { Network } from "./network";
import * as lb from "./lb";
import * as ecs from "./ecs";
import { Role } from "./roles";
import * as cert from "./certificate";

const config = new pulumi.Config();

// VPC configuration
const vpcCIDR: pulumi.Input<string> = config.require("vpcCIDR");
const awsNetwork: Network = new Network(vpcCIDR);

const role: Role = new Role();
const certificateValidation: aws.acm.CertificateValidation = cert.CreateCertificate();
const loadBalancer: {
    targetGroups: aws.lb.TargetGroup[], 
    lbListeners: aws.lb.Listener[], 
    dnsName: pulumi.Output<string>
} = lb.CreateLoadBalancer(awsNetwork, certificateValidation.certificateArn);

const ecsWA = ecs.CreateFargateService(
    awsNetwork, 
    loadBalancer.targetGroups, 
    loadBalancer.lbListeners, 
    loadBalancer.dnsName,
    role.getTraefikRole(),
    role.getECSRole(),
    );


