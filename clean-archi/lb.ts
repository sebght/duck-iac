import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as network from "./network";
import * as variables from "./variables"

export function CreateLoadBalancer(network: network.Network, certificateArn: pulumi.Output<string>): 
    {targetGroups: aws.lb.TargetGroup[], lbListeners: aws.lb.Listener[], dnsName: pulumi.Output<string>} {

    const lb = new aws.lb.LoadBalancer("lb", {
        loadBalancerType: "application",
        securityGroups: [network.getSG(0).id],
        subnets: [
            network.getSubnet(0).id,
            network.getSubnet(1).id
        ],
        tags: variables.defaultTags
    });

    const targetGroupTraefik = new aws.lb.TargetGroup("targetGroupTraefik", {
        name: "traefik",
        port: 80,
        protocol: "HTTP",
        vpcId: network.getVpc().id,
        targetType: "ip",
        healthCheck: {
            path: "/",
            matcher: "200-202,404"
        },
        tags: variables.defaultTags
    });

    const targetGroupTraefikAPI = new aws.lb.TargetGroup("targetGroupTraefikAPI", {
        name: "traefikAPI",
        port: 8080,
        protocol: "HTTP",
        vpcId: network.getVpc().id,
        targetType: "ip",
        healthCheck: {
            path: "/",
            matcher: "200-202,300-302"
        },
        tags: variables.defaultTags
    });

    const lbListenerTraefik = new aws.lb.Listener("lbListenerTraefik", {
        loadBalancerArn: lb.arn,
        port: 80,
        protocol: "HTTP",
        defaultActions: [{
            type: "redirect",
            redirect: {
                port: "443",
                protocol: "HTTPS",
                statusCode: "HTTP_301",
            }
        }],
    });

    const lbListenerHTTPS = new aws.lb.Listener("lbListenerHTTPS", {
        loadBalancerArn: lb.arn,
        port: 443,
        protocol: "HTTPS",
        sslPolicy: "ELBSecurityPolicy-2016-08",
        certificateArn: certificateArn,
        defaultActions: [{
            type: "forward",
            targetGroupArn: targetGroupTraefik.arn,
        }],
    });

    const lbListenerTraefikAPI = new aws.lb.Listener("lbListenerTraefikAPI", {
        loadBalancerArn: lb.arn,
        port: 8080,
        protocol: "HTTP",
        defaultActions: [{
            type: "forward",
            targetGroupArn: targetGroupTraefikAPI.arn,
        }],
    });

    const targetGroups: aws.lb.TargetGroup[] = [targetGroupTraefik, targetGroupTraefikAPI];
    const lbListeners: aws.lb.Listener[] = [lbListenerTraefik, lbListenerTraefikAPI];
    const dnsName: pulumi.Output<string> = lb.dnsName;
    return {targetGroups, lbListeners, dnsName};
}
