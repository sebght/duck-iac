import { Cluster } from "../domain/container-service/cluster";

export interface IContainerServiceRepository {
    deploy({
        cluster, 
        targetGroups, 
        listeners, 
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
    }): void;
}
