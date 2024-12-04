import { LoadBalancer } from "../domain/loadbalancer/LoadBalancer";
import { TargetGroup } from "../domain/loadbalancer/TargetGroup";
import { Listener } from "../domain/loadbalancer/Listener";
import { IVpcRepository } from "./IVpcRepository";

export interface ILoadBalancerRepository {
    /** Méthode à implementer dans le repository du cloud provider */
    GetDeployedResource(resourceName: string): any;
    deploy(vpcRepository: IVpcRepository, loadBalancers: LoadBalancer[], targetGroups: TargetGroup[], listeners: Listener[]): void
}