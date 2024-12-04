import { Cluster } from "../domain/container-service/cluster";
import { IContainerServiceRepository } from "../repository/IContainerServiceRepository";
import { ILoadBalancerRepository } from "../repository/ILoadBalancerRepository";
import { IVpcRepository } from "../repository/IVpcRepository";

export function DeployerWorkAdventure(loadBalancerRepository: ILoadBalancerRepository, vpcRepository: IVpcRepository, awsContainerServiceRepository: IContainerServiceRepository) {
    const cluster = new Cluster("cluster-workadventure");

    /** Conteneur bidon */
    const whoTargetGroup = loadBalancerRepository.GetDeployedResource("who-target-group");
    const whoListener = loadBalancerRepository.GetDeployedResource("who-listener");

    const httpListener = loadBalancerRepository.GetDeployedResource("http-listener");
    const httpsListener = loadBalancerRepository.GetDeployedResource("https-listener");
    const playTargetGroup = loadBalancerRepository.GetDeployedResource("play-target-group");
    const chatTargetGroup = loadBalancerRepository.GetDeployedResource("chat-target-group");
    const iconTargetGroup = loadBalancerRepository.GetDeployedResource("icon-target-group");
    const mapStorageTargetGroup = loadBalancerRepository.GetDeployedResource("map-storage-target-group");
    const ejabberdTargetGroup = loadBalancerRepository.GetDeployedResource("ejabberd-target-group");
    
    const subnetPrivateA = vpcRepository.GetDeployedResource("private-a");
    const subnetPrivateB = vpcRepository.GetDeployedResource("private-b");
    const securityGroup = vpcRepository.GetDeployedResource("default-sg");

    /** Test service discovery */
    const serviceConnect = vpcRepository.GetDeployedResource("service-workadventure");

    /** Test EFS */
    const deployedEfs = vpcRepository.GetDeployedResource("efs-workadventure");

    awsContainerServiceRepository.deploy({
        cluster, 
        targetGroups: [whoTargetGroup, playTargetGroup, chatTargetGroup, iconTargetGroup, mapStorageTargetGroup, ejabberdTargetGroup], 
        listeners: [whoListener, httpListener, httpsListener], 
        subnets: [subnetPrivateA, subnetPrivateB], 
        securityGroup,
        serviceConnect,
        deployedEfs
    });
}