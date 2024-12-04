import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as variables from "./variables"

export class Role {
    private traefikRole: aws.iam.Role;
    private ecsRole: aws.iam.Role;

    constructor() {
        this.traefikRole = new aws.iam.Role("traefikRole", {
            name: "traefikRole",
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
            tags: variables.defaultTags
        });
    
        const traefikPolicyDocument = aws.iam.getPolicyDocumentOutput({
            statements: [{
                sid: "main",
                actions: [
                    "ecs:ListClusters",
                    "ecs:DescribeClusters",
                    "ecs:ListTasks",
                    "ecs:DescribeTasks",
                    "ecs:DescribeContainerInstances",
                    "ecs:DescribeTaskDefinition",
                    "ec2:DescribeInstances"
                ],
                resources: ["*"],
            }],
        });
    
        const traefikPolicy = new aws.iam.RolePolicy("traefikPolicy", {
            name: "traefikPolicy",
            role: this.traefikRole.id,
            policy: traefikPolicyDocument.apply(traefikPolicyDocument => traefikPolicyDocument.json)
        });
    
        this.ecsRole = new aws.iam.Role("ecsRole", {
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
            tags: variables.defaultTags
        });
    
        const ecsPolicy = new aws.iam.RolePolicyAttachment("ecsPolicy", {
            role: this.ecsRole.name,
            policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
        });
    
        const ecsPolicySecrets = new aws.iam.RolePolicyAttachment("ecsPolicySecrets", {
            role: this.ecsRole.name,
            policyArn: "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
        }); 
    }

    getECSRole(): aws.iam.Role {
        return this.ecsRole;
    }
    
    getTraefikRole(): aws.iam.Role {
        return this.traefikRole;
    }
}
