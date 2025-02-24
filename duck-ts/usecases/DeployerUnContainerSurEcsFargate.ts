import {IProgram, StackDependency} from "../tools/layer";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import {AwsECSRepository} from "../repository/AwsECSRepository";

export class ContainerSurEcsFargate implements IProgram {

    public plugins: StackDependency[];
    constructor(plugins: StackDependency[]) {
        this.plugins = plugins
    }
    public name(): string {
        return "container-fargate"
    };
    public async run() {
        const awsECSRepository = new AwsECSRepository()
        const image: string = "ttl.sh/octo/duck-app:1.0.0"
        const exposePubliquement: boolean = true
        const loadBalancerUrl = awsECSRepository.deploie(image, exposePubliquement)
        return { url: loadBalancerUrl } ;
    };
}