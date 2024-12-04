import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";


export function CreateFargate(subnetId: pulumi.Input<string>, securityGroupIds: pulumi.Input<string>[]) {

    const cluster = new aws.ecs.Cluster("cluster-pulumi-doc", {});
    // aws-cli

    const service = new awsx.ecs.FargateService("service-pulumi-doc", {
        cluster: cluster.arn,
        networkConfiguration: {
            subnets: [subnetId],
            securityGroups: securityGroupIds,
        },
        desiredCount: 2,
        taskDefinitionArgs: {
            container: {
                image: "nginx:latest",
                cpu: 512,
                memory: 128,
                essential: true,
            },
        },
        tags: {"Owner": "RICI"}
    });

    // const service = new awsx.ecs.FargateService("uploader", {
    //     desiredCount: 1,
    //     cluster: cluster.arn,
    //     // assignPublicIp: true,
    //     networkConfiguration: {
    //         subnets: [subnetId],
    //         securityGroups: securityGroupIds
    //     },
    //     taskDefinitionArgs: {
    //         container: {
    //             image: "nginx:latest", //"thecodingmachine/workadventure-uploader:v1.15.10",
    //             cpu: 512,
    //             memory: 128,
    //             // portMappings: [{
    //             //     containerPort: 8080,
    //             //     hostPort: 8080,
    //             // }],
    //             // environment: [{
    //             //     name: "REDIS_HOST",
    //             //     value: "13.38.103.231"
    //             // },
    //             // {
    //             //     name: "REDIS_PORT",
    //             //     value: "6379"
    //             // },
    //             // {
    //             //     name: "ENABLE_CHAT_UPLOAD",
    //             //     value: "true"
    //             // },
    //             // {
    //             //     name: "UPLOAD_MAX_FILESIZE",
    //             //     value: "10485760"
    //             // },
    //             // {
    //             //     name: "UPLOADER_URL",
    //             //     value: "https://uploader.workadventure.aws.ocho.ninja"
    //             // }]
                
    //         },
    //     },

    //     tags: {"Owner": "RICI"}
    // });

    return service;
}


