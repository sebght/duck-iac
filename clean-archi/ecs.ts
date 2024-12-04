import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as network from "./network";
import * as variables from "./variables"

export function CreateFargateService(
        network: network.Network, 
        targetGroups: aws.lb.TargetGroup[], 
        lbListeners: aws.lb.Listener[],
        dnsName: pulumi.Output<string>,
        traefikRole: aws.iam.Role, 
        ecsRole: aws.iam.Role,
    ) {

    const cluster = new aws.ecs.Cluster("cluster-workadventure", {
        name: "cluster-workadventure",
        settings: [{
            name: "containerInsights",
            value: "enabled",
        }],
        tags: variables.defaultTags
    });

    const taskDefinition = new aws.ecs.TaskDefinition("maps-icon", {
        family: "maps-icon",
        cpu: "512",
        memory: "1024",
        containerDefinitions: JSON.stringify([
            {
                name: "icon",
                image: "matthiasluedtke/iconserver:v3.13.0",
                // cpu: 256,
                // memory: 512,
                essential: true,
                portMappings: [{
                    containerPort: 8080,
                    hostPort: 8080,
                }],
                dockerLabels: {
                    // "traefik.http.routers.whoami.rule": "Host(`"+ dnsName.apply(f => `${f}`) +"`)",
                    "traefik.enable": "true"
                }
            },
            {
                name: "map-storage",
                image: "thecodingmachine/workadventure-map-storage:v1.15.10",
                // cpu: 1024,
                // memory: 2048,
                essential: true,
                portMappings: [{
                    containerPort: 3000,
                    hostPort: 3000,
                }],
                environment: [{
                    name: "AUTHENTICATION_STRATEGY",
                    value: "Basic"
                },
                {
                    name: "AUTHENTICATION_USER",
                    value: "RICI"
                },
                {
                    name: "AUTHENTICATION_PASSWORD",
                    value: "ricirici"
                }]
            },
        ]),
        networkMode: "awsvpc",
        requiresCompatibilities: ["FARGATE"],
        tags: variables.defaultTags,
    });

    const traefikTask = new aws.ecs.TaskDefinition("traefik", {
        family: "traefik",
        cpu: "256",
        memory: "512",
        containerDefinitions: cluster.name.apply(name => JSON.stringify([
            {
                name: "traefik",
                image: "traefik:v2.8",
                entryPoint: ["traefik", "--providers.ecs.clusters", name, "--log.level", "DEBUG", "--providers.ecs.region", "eu-west-3", "--api.insecure"],
                essential: true,
                // logConfiguration :{
                //     logDriver: "awslogs",
                //     options: {
                //         "awslogs-region": "eu-west-3",
                //         "awslogs-stream-prefix": "traefik"
                //     }
                //   },
            
                portMappings: [{
                    containerPort: 8080,
                    hostPort: 8080,
                },
                {
                    containerPort: 80,
                    hostPort: 80,
                }],
            },
        ])),
        executionRoleArn: ecsRole.arn,
        taskRoleArn: traefikRole.arn,
        networkMode: "awsvpc",
        requiresCompatibilities: ["FARGATE"],
        tags: variables.defaultTags,
    });

    const whoTaskDefinition = new aws.ecs.TaskDefinition("who", {
        family: "who",
        cpu: "512",
        memory: "1024",
        containerDefinitions: dnsName.apply(name => JSON.stringify([
            {
                name: "who",
                image: "containous/whoami:v1.5.0",
                essential: true,
                portMappings: [{
                    containerPort: 80,
                    hostPort: 80,
                }],
                dockerLabels: {
                    "traefik.http.routers.whoami.rule": "Host(`who.workadventure.aws.ocho.ninja`)",
                    "traefik.enable": "true"
                },
            }
        ])),
        networkMode: "awsvpc",
        requiresCompatibilities: ["FARGATE"],
        tags: variables.defaultTags,
    });

    // const playTaskDefinition = new aws.ecs.TaskDefinition("play", {
    //     family: "play",
    //     cpu: "512",
    //     memory: "1024",
    //     containerDefinitions: JSON.stringify([
    //         {
    //             name: "play",
    //             image: "thecodingmachine/workadventure-play:v1.15.10",
    //             essential: true,
    //             portMappings: [{
    //                 containerPort: 3000,
    //                 hostPort: 3000,
    //             }],
    //             dockerLabels: {
    //                 // "traefik.http.routers.whoami.rule": "Host(`"+ dnsName.apply(f => `${f}`) +"`)",
    //                 "traefik.enable": "true"
    //             },

    //             environment: [{

    //             }]
    //         },
    //     ]),
    //     networkMode: "awsvpc",
    //     requiresCompatibilities: ["FARGATE"],
    //     tags: variables.defaultTags,
    // });


    const traefikService = new aws.ecs.Service("traefikService", {
        name: "traefik",
        launchType: "FARGATE",
        cluster: cluster.id,
        taskDefinition: traefikTask.arn,
        desiredCount: 1,
        enableEcsManagedTags: true,
        propagateTags: "SERVICE",
        
        loadBalancers: [{
            targetGroupArn: targetGroups[0].arn, // trouver une ecriture plus lisible genre "targetGroups[traefikAPI]"
            containerName: "traefik",
            containerPort: 80,
        }, {
            targetGroupArn: targetGroups[1].arn,
            containerName: "traefik",
            containerPort: 8080,
        }],

        networkConfiguration: {
            subnets: [
                network.getSubnet(2).id,
                network.getSubnet(3).id,
            ],
            securityGroups: [ network.getSG(0).id ]
        },

        tags: variables.defaultTags

    }, {
        dependsOn: lbListeners
    });

    const service = new aws.ecs.Service("whoami", {
        name: "Workadventure",
        launchType: "FARGATE",
        cluster: cluster.id,
        taskDefinition: whoTaskDefinition.arn,
        desiredCount: 3,
        enableEcsManagedTags: true,
        propagateTags: "SERVICE",
        
        // loadBalancers: [{
        //     targetGroupArn: targetGroup.arn,
        //     containerName: "traefik",
        //     containerPort: 8080,
        // }],

        networkConfiguration: {
            subnets: [
                network.getSubnet(2).id,
                network.getSubnet(3).id,
            ],
            securityGroups: [ network.getSG(0).id ]
        },

        tags: variables.defaultTags

    }, {
        dependsOn: lbListeners
    });

}