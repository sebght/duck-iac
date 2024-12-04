import * as aws from "@pulumi/aws";
import * as variables from "../variables";
import * as fs from "fs";
import { IContainerServiceRepository } from "./IContainerServiceRepository";
import { Cluster } from "../domain/container-service/cluster";

export class AwsContainerServiceRepository implements IContainerServiceRepository {
    private CreateRoles() {
        const ecsRole = new aws.iam.Role("ecsRole", {
            name: "ecsRole",
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Sid: "",
                    Principal: {
                        Service: "ecs-tasks.amazonaws.com",
                    },
                }],
            }),
            tags: variables.GetTagWithResourceName("ecsRole")
        });
    
        const ecsPolicy = new aws.iam.RolePolicyAttachment("ecsPolicy", {
            role: ecsRole.name,
            policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
        });
    
        const ecsPolicySecrets = new aws.iam.RolePolicyAttachment("ecsPolicySecrets", {
            role: ecsRole.name,
            policyArn: "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
        });

        return ecsRole;
    }

    private CreateLogGroup() {
        const logGroup = new aws.cloudwatch.LogGroup("ecs/WorkAdventure", {
            name: "/ecs/WorkAdventure",
            retentionInDays: 1,
            tags: variables.GetTagWithResourceName("logGroup - ecs/WorkAdventure")
        });
    }

    private CreateTaskDefinition(nom: string, containerDefinitions: string, ecsRole: any, cpu: string = "256", memory: string = "512", networkMode: string = "awsvpc") {
        const taskDefinition = new aws.ecs.TaskDefinition(nom, {
            family: nom,
            cpu: cpu,
            memory: memory,
            containerDefinitions: containerDefinitions,
            networkMode: networkMode,
            requiresCompatibilities: ["FARGATE"],
            executionRoleArn: ecsRole.arn,
            tags: variables.GetTagWithResourceName(nom)
        });

        return taskDefinition;
    }

    private CreateServiceDiscovery(nom: string, serviceNamespace: any) {
        const serviceDiscovery = new aws.servicediscovery.Service(nom, {
            name: nom,
            namespaceId: serviceNamespace.id,
            dnsConfig: {
                namespaceId: serviceNamespace.id,
                dnsRecords: [{
                    ttl: 60,
                    type: "A",
                }],
                routingPolicy: "MULTIVALUE",
            },
            healthCheckCustomConfig: {
                failureThreshold: 1,
            },
        });

        return serviceDiscovery;
    }

    private createService(nom: string, isInTargetGroup: boolean, deployedCluster: any, taskDefinition: any, desiredCount: number, subnetIds: any[], securityGroupIds: any[], listeners: any[], serviceNamespace: any, targetGroup?: any) {
        var deployedService;
        const serviceDiscovery = this.CreateServiceDiscovery(nom, serviceNamespace);
        if(isInTargetGroup) {
            deployedService = new aws.ecs.Service(nom, {
                name: nom,
                launchType: "FARGATE",
                cluster: deployedCluster.id,
                taskDefinition: taskDefinition.arn,
                desiredCount: desiredCount,
                enableEcsManagedTags: true,
                propagateTags: "SERVICE",
                serviceRegistries: {
                    registryArn: serviceDiscovery.arn,
                },
                loadBalancers: [{
                    targetGroupArn: targetGroup.arn,
                    containerName: nom,
                    containerPort: targetGroup.port,
                }],
                networkConfiguration: {
                    subnets: subnetIds,
                    securityGroups: securityGroupIds
                },
                tags: variables.defaultTags
            }, {
                dependsOn: listeners,
            });
        } else {
            deployedService = new aws.ecs.Service(nom, {
                name: nom,
                launchType: "FARGATE",
                cluster: deployedCluster.id,
                taskDefinition: taskDefinition.arn,
                desiredCount: desiredCount,
                enableEcsManagedTags: true,
                propagateTags: "SERVICE",
                serviceRegistries: {
                    registryArn: serviceDiscovery.arn,
                },
                networkConfiguration: {
                    subnets: subnetIds,
                    securityGroups: securityGroupIds
                },
                tags: variables.defaultTags
            }, {
                dependsOn: listeners,
                });
        }

        return deployedService;
    }

    public deploy({
        cluster, 
        targetGroups: [whoTargetGroup, playTargetGroup, chatTargetGroup, iconTargetGroup, mapStorageTargetGroup, ejabberdTargetGroup], 
        listeners: [whoListener, httpListener, httpsListener], 
        subnets: [subnetPrivateA, subnetPrivateB], 
        securityGroup,
        serviceConnect,
        deployedEfs
    }: {
        cluster: Cluster, 
        targetGroups: any[], 
        listeners: any[], 
        subnets: any[], 
        securityGroup: any,
        serviceConnect: any,
        deployedEfs: any
    }): void {
        const subnets = [subnetPrivateA, subnetPrivateB];
        const ecsRole = this.CreateRoles();
        this.CreateLogGroup();


        /** Creation des TaskDefinitions a partir des fichiers JSON */
       
        const ejabberdContainerDefinition = fs.readFileSync("wa-ejabberd.json").toString();
        const playContainerDefinition = fs.readFileSync("wa-play.json").toString();
        const chatContainerDefinition = fs.readFileSync("wa-chat.json").toString();
        const backContainerDefinition = fs.readFileSync("wa-back.json").toString();
        const iconContainerDefinition = fs.readFileSync("wa-icon.json").toString();
        const mapStorageContainerDefinition = fs.readFileSync("wa-map-storage.json").toString();
        const redisContainerDefinition = fs.readFileSync("wa-redis.json").toString();
        const uploaderContainerDefinition = fs.readFileSync("wa-uploader.json").toString();

        // On n'utilise pas la fonction CreateTaskDefinition car on déclare un montage EFS
        const ejabberdTaskDefinition = new aws.ecs.TaskDefinition("ejabberd-task-definition", {
            family: "ejabberd-task-definition",
            cpu: "1024",
            memory: "2048",
            containerDefinitions: ejabberdContainerDefinition,
            networkMode: "awsvpc",
            requiresCompatibilities: ["FARGATE"],
            executionRoleArn: ecsRole.arn,
            volumes: [
                {
                    name: "efs-workadventure",
                    efsVolumeConfiguration: {
                        fileSystemId: deployedEfs.id,
                        transitEncryption: "ENABLED"
                    }
                }
            ],
            tags: variables.GetTagWithResourceName("ejabberd-task-definition")
        });

        /** Conteneur bidon */
        const whoContainerDefinition = fs.readFileSync("who.json").toString();
        const whoTaskDefinition = this.CreateTaskDefinition("who-task-definition", whoContainerDefinition, ecsRole);

        const playTaskDefinition = this.CreateTaskDefinition("play-task-definition", playContainerDefinition, ecsRole, "1024", "2048");
        const backTaskDefinition = this.CreateTaskDefinition("back-task-definition", backContainerDefinition, ecsRole, "1024", "2048");
        const uploaderTaskDefinition = this.CreateTaskDefinition("uploader-task-definition", uploaderContainerDefinition, ecsRole, "1024", "2048");
        const mapStorageTaskDefinition = this.CreateTaskDefinition("map-storage-task-definition", mapStorageContainerDefinition, ecsRole, "1024", "2048");
        const redisTaskDefinition = this.CreateTaskDefinition("redis-task-definition", redisContainerDefinition, ecsRole, "256", "512");
        const chatTaskDefinition = this.CreateTaskDefinition("chat-task-definition", chatContainerDefinition, ecsRole, "256", "512");
        const iconTaskDefinition = this.CreateTaskDefinition("icon-task-definition", iconContainerDefinition, ecsRole, "256", "512");
         
        /** Creation du cluster et les services */
        const deployedCluster = new aws.ecs.Cluster(cluster.getName(), {
            name: cluster.getName(),
            settings: [{
                name: "containerInsights",
                value: "enabled",
            }],
            tags: variables.defaultTags
        });
     
        deployedCluster.name.apply(name => {
            const playService = this.createService("play", true, deployedCluster, playTaskDefinition, 3, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect, playTargetGroup);
            const chatService = this.createService("chat", true, deployedCluster, chatTaskDefinition, 1, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect, chatTargetGroup);
            const iconService = this.createService("icon", true, deployedCluster, iconTaskDefinition, 1, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect, iconTargetGroup);
            //const ejabberdService = this.createService("ejabberd", true, deployedCluster, ejabberdTaskDefinition, 1, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect, ejabberdTargetGroup);
            const mapStorageService = this.createService("map-storage", true, deployedCluster, mapStorageTaskDefinition, 1, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect, mapStorageTargetGroup);
            const backService = this.createService("back", false, deployedCluster, backTaskDefinition, 1, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect);
            const redisService = this.createService("redis", false, deployedCluster, redisTaskDefinition, 1, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect);
            const uploaderService = this.createService("uploader", false, deployedCluster, uploaderTaskDefinition, 1, subnets, [securityGroup], [httpListener, httpsListener, ecsRole], serviceConnect);

            /** Conteneur bidon */
            const whoService = new aws.ecs.Service("who", {
                name: "who",
                launchType: "FARGATE",
                cluster: deployedCluster.id,
                taskDefinition: whoTaskDefinition.arn,
                desiredCount: 1,
                enableEcsManagedTags: true,
                propagateTags: "SERVICE",
               
                loadBalancers: [{
                    targetGroupArn: whoTargetGroup.arn,
                    containerName: "who",
                    containerPort: 80,
                }],
                networkConfiguration: {
                    subnets: [
                        subnetPrivateA.id,
                        subnetPrivateB.id,
                    ],
                    securityGroups: [ securityGroup.id ]
                },
                tags: variables.defaultTags
            }, {
                dependsOn: [whoListener, ecsRole],
            });
        })
    }
}
