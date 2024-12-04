import * as aws from "@pulumi/aws";
import { Vpc } from "../domain/vpc/vpc";
import { IVpcRepository } from "./IVpcRepository";
import * as variables from "../variables";
import { Association, Route, RouteTable, TargetType } from "../domain/vpc/RouteTable";
import { Eip } from "../domain/vpc/Eip";
import { Subnet } from "../domain/vpc/subnet";
import { NatGateway } from "../domain/vpc/NatGateway";
import { SecurityGroup } from "../domain/vpc/SecurityGroup";

// type AwsNetwork = {
//     vpc: aws.ec2.Vpc,
//     subnets: aws.ec2.Subnet[]
// }

export class AwsVpcRepository implements IVpcRepository{
    // On a un resourceMap privé à cette classe et qui va garder tous les resources déployés
    /** si un autre repository a besoin de ces resources :
     * 1. on envoie comme parametre le repository dans le use-case:
     *      ex. dans le use-case "DeployerWorkAdventure", on a besoin des subnets et vpc, donc
     *      ...
     *      loadBalancerRepository.deploy(vpcRepository, loadBalancer, traefikTargetGroup, listener)
     *                                     repository   <------------------------------------------->
     *                                      dependant       objets metier à deployer dans le cloud
     * 
     * 2. à l'interieur du repository, on appelle la methode "GetDeployedResource" : 
     *      ex. :
     *      const deployedVpc = vpcRepository.GetDeployedResource("vpc-workadventure")
     *      ...
     *      const deployedTruc = new aws.Resource(nom, {
     *          vpcId: deployedVpc.id
     *      })
     * 
     * Cela implique qu'on aura besoin de recevoir le vpcRepository comme parametre dans l'use-case, donc c'est l'index
     * qui va envoyer ce parametre.
     * 
     * --> bien documenter les uses cases, avec les parametres (et retours ?)
     * */ 

    private vpcResourceMap: Map<string, any>;
    constructor() { this.vpcResourceMap = new Map<string, any>(); }

    private AddResource(resourceName: string, resourceType: any): void {
        this.vpcResourceMap.set(resourceName, resourceType);
    }

    public GetDeployedResource(resourceName: string): any {
        // gerer les exceptions, par exemple, s'il n'existe pas une resource avec ce nom (resourceMap.has())
        return this.vpcResourceMap.get(resourceName);
    }

    private CreateVpc(vpc: Vpc): void {
        let vpcDeployed = new aws.ec2.Vpc(vpc.getName(), {
            cidrBlock: vpc.getCidrBlock(),
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: variables.GetTagWithResourceName(vpc.getName())
        });

        this.AddResource(vpc.getName(), vpcDeployed);
    }

    private CreateInternetGateway(vpc: Vpc): void {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let internetGatewayDeployed = new aws.ec2.InternetGateway(vpc.getInternetGateway()!.getName(), {
            vpcId: vpcDeployed.id,
            tags: variables.GetTagWithResourceName(vpc.getInternetGateway()!.getName())
        });
        this.AddResource(vpc.getInternetGateway()!.getName(), internetGatewayDeployed);
    }

    private CreateEip(eip: Eip): void {
        let eipDeployed = new aws.ec2.Eip(eip.getName(), {
            vpc: eip.IsInVpc(),
            tags: variables.GetTagWithResourceName(eip.getName())
        });
        this.AddResource(eip.getName(), eipDeployed);
    }

    private CreateNatGateway(nat: NatGateway, subnet: Subnet) {
        let subnetDeployed = this.GetDeployedResource(subnet.getName());
        if (nat.IsPublic()) {
            let eipDeployed = this.GetDeployedResource(nat.getEip()!.getName());
            
            // Si le Eip lié n'a pas été déployé dans l'use case
            if (eipDeployed == null) {
                this.CreateEip(nat.getEip()!)
                eipDeployed = this.GetDeployedResource(nat.getEip()!.getName());
            }

            let natDeployed = new aws.ec2.NatGateway(nat.getName(), {
                subnetId: subnetDeployed.id,
                connectivityType: "public",
                allocationId: eipDeployed.id,
                tags: variables.GetTagWithResourceName(nat.getName())
            });
            this.AddResource(nat.getName(), natDeployed);
        }
        else {
            let natDeployed = new aws.ec2.NatGateway(nat.getName(), {
                subnetId: subnetDeployed.id,
                connectivityType: "private",
                tags: variables.GetTagWithResourceName(nat.getName())
            });
            this.AddResource(nat.getName(), natDeployed);
        }
    }

    private CreateSubnet(vpc: Vpc, subnet: Subnet) {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let subnetDeployed = new aws.ec2.Subnet(subnet.getName(), {
            vpcId: vpcDeployed.id,
            cidrBlock: subnet.getCidrBlock(),
            availabilityZone: subnet.getAvailabilityZone(),
            tags: variables.GetTagWithResourceName(subnet.getName())
        });
        this.AddResource(subnet.getName(), subnetDeployed);

        // S'il y a des NAT à l'interieur de cette subnet, on les deploie
        if (subnet.getNatGateways() != null) {
            for (let natIndex in subnet.getNatGateways()) {
                this.CreateNatGateway(subnet.getNatGateways()[natIndex], subnet)                
            }
        }
    }

    // Faire deux fonctions differentes : une pour chaque type de target
    // ex. CreateRouteIG() & CreateRouteNat()
    private CreateRoute(route: Route, routeTableDeployed: aws.ec2.RouteTable) {
        switch (route.targetType) {
            case TargetType.InternetGateway:
                let internetGatewayDeployed = this.GetDeployedResource(route.target.targetInternetGateway!.getName());
                let routeDeployedIGW = new aws.ec2.Route("route-" + TargetType[TargetType.InternetGateway], {
                    routeTableId: routeTableDeployed.id,
                    destinationCidrBlock: route.destinationCidr,
                    gatewayId: internetGatewayDeployed.id,
                });
                this.AddResource("route-" + TargetType[TargetType.InternetGateway], routeDeployedIGW);
                break;

            case TargetType.NatGateway:
                let natDeployed = this.GetDeployedResource(route.target.targetNatGateway!.getName());
                let routeDeployedNAT = new aws.ec2.Route("route-" + TargetType[TargetType.NatGateway], {
                    routeTableId: routeTableDeployed.id,
                    destinationCidrBlock: route.destinationCidr,
                    natGatewayId: natDeployed.id
                });
                this.AddResource("route-" + TargetType[TargetType.NatGateway], routeDeployedNAT);
                break;
        
            default:
                break;
        }
    }

    private CreateRouteTableAssociation(asso: Association, routeTableDeployed: aws.ec2.RouteTable) {
        let subnetDeployed = this.GetDeployedResource(asso.target.getName());
        let association = new aws.ec2.RouteTableAssociation("association-" + asso.target.getName(), {
            subnetId: subnetDeployed.id,
            routeTableId: routeTableDeployed.id
        });
        this.AddResource("association-" + asso.target.getName(), association);
    }

    private CreateRouteTable(vpc: Vpc, routeTable: RouteTable) {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let routeTableDeployed = new aws.ec2.RouteTable(routeTable.getName(), {
            vpcId: vpcDeployed.id,
            tags: variables.GetTagWithResourceName(routeTable.getName())
        });
        this.AddResource(routeTable.getName(), routeTableDeployed);

        // On ajoute toutes les routes existantes dans la Route Table
        if (routeTable.getRoutes() != null) {
            for (let route of routeTable.getRoutes()) {
                this.CreateRoute(route, routeTableDeployed);
            }  
        }

        // On crée toutes les associations
        if (routeTable.getAssociations() != null) {
            for (let asso of routeTable.getAssociations()) {
                this.CreateRouteTableAssociation(asso, routeTableDeployed);
            }  
        }
    }

    private CreateSecurityGroup(vpc: Vpc, sg: SecurityGroup) {
        let vpcDeployed = this.GetDeployedResource(vpc.getName());
        let securityGroupDeployed = new aws.ec2.SecurityGroup(sg.getName(), {
            vpcId: vpcDeployed.id,
            ingress: sg.getInboundRules(),
            egress: sg.getOutboundRules(),
            tags: variables.GetTagWithResourceName(sg.getName())
        })
        this.AddResource(sg.getName(), securityGroupDeployed);
    }


    public deploy(vpc: Vpc): void {
        // Deploiement du VPC
        this.CreateVpc(vpc);

        // Deploiement de l'internet gateway (s'il en existe un)
        if (vpc.getInternetGateway() != null) {
            this.CreateInternetGateway(vpc);
        }
        
        // Deploiement des EIP s'il y en a
        if (vpc.getEips() != null) {
            for (let eip of vpc.getEips()) {
                this.CreateEip(eip);
            }
        }

        // Deploiement des subnets
        if (vpc.getSubnets() != null) {
            for (let subnet of vpc.getSubnets()) {
                this.CreateSubnet(vpc, subnet);
            }
        }

        // Deploiment des route tables (s'ils existent)
        if (vpc.getRouteTables() != null) {
            for (let routeTable of vpc.getRouteTables()) {
                this.CreateRouteTable(vpc, routeTable);
            }
        }

        // Deploiment des security groups (s'ils existent)
        if (vpc.getSecurityGroups() != null) {
            for (let sg of vpc.getSecurityGroups()) {
                this.CreateSecurityGroup(vpc, sg);
            }
        }

        /** Test Service Discovery */
        const deployedVpc = this.GetDeployedResource(vpc.getName());
        const serviceWorkadventure = new aws.servicediscovery.PrivateDnsNamespace("workadventure", {
            name: "workadventure",
            description: "A namespace for workadventure services",
            vpc: deployedVpc.id,
        });

        this.AddResource("service-workadventure", serviceWorkadventure);

        /** Test EFS */
        const efs = new aws.efs.FileSystem("efs-workadventure", {
            encrypted: true,
            tags: {
                Name: "efs-workadventure",
                Owner: "RICI"
            }
        });

        const deployedSubnet = this.GetDeployedResource("public-a");
        const deployedSG = this.GetDeployedResource("default-sg");

        const publicAMountTarget = new aws.efs.MountTarget("publicAMountTarget", {
            fileSystemId: efs.id,
            subnetId: deployedSubnet.id,
            securityGroups: [deployedSG]
        });

        this.AddResource("efs-workadventure", efs);

        // EC2 pour monter l'EFS et copier le fichier ejabberd.template.yml
        
        // const keyPair = new aws.ec2.KeyPair("keypair", {
        //     publicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKH0xK5oup7Sr0pLwYU4FOhV3pGT3r2TY6lkWHdwSBru terraform"
        // });

        // const mountEFS = new aws.ec2.Instance("mountEFS", {
        //     ami: "ami-05b5a865c3579bbc4",
        //     instanceType: "t2.micro",
        //     associatePublicIpAddress: true,
        //     keyName: keyPair.keyName,
        //     vpcSecurityGroupIds: deployedSG.id,
        //     subnetId: deployedSubnet.id,
        //     tags: variables.defaultTags
        // });
        /** Fin test */
    }
}