import { Vpc } from "../domain/vpc/vpc";

export interface IVpcRepository {
    /** Méthode à implementer dans le repository du cloud provider (ex. AwsVpcRepository) */
    GetDeployedResource(resourceName: string): any;
    deploy(vpc: Vpc): void;
}

export type Network = {
    vpc: any,
    subnets: any[]
}