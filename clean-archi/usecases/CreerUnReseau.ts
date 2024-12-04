import { RouteTable, TargetType } from "../domain/vpc/RouteTable";
import { NatGateway } from "../domain/vpc/NatGateway";
import { Eip } from "../domain/vpc/Eip";
import { InternetGateway } from "../domain/vpc/InternetGateway";
import { Subnet } from "../domain/vpc/subnet";
import { Vpc } from "../domain/vpc/vpc";
import { SecurityGroup, Rule } from "../domain/vpc/SecurityGroup";
import { IVpcRepository } from "../repository/IVpcRepository";

/**
 * Crée un réseau avec un VPC, 2 subnets publics, 2 subnetss privés, un internet gateway, un NAT,
 * un security group et deux tables de routage (une publique et une privée).
 * @param vpcRepository le repository à utiliser pour la création du réseau
 * @returns un objet métier VPC
 */
export function CreerUnReseau(vpcRepository: IVpcRepository): Vpc {
    const vpc: Vpc = new Vpc("vpc-workadventure", "10.0.0.0/16");
    const subnetPublicA: Subnet = new Subnet("public-a", true,  "10.0.0.0/24", "eu-west-3a");
    const subnetPublicB: Subnet = new Subnet("public-b", true,  "10.0.1.0/24", "eu-west-3b");
    const subnetPrivateA: Subnet = new Subnet("private-a", false,  "10.0.2.0/24", "eu-west-3a");
    const subnetPrivateB: Subnet = new Subnet("private-b", false,  "10.0.3.0/24", "eu-west-3b");
    
    vpc.addSubnet(subnetPublicA);
    vpc.addSubnet(subnetPublicB);
    vpc.addSubnet(subnetPrivateA);
    vpc.addSubnet(subnetPrivateB);

    const internetGateway: InternetGateway = new InternetGateway("igw-workadventure");
    vpc.addInternetGateway(internetGateway);

    const eip: Eip = new Eip("eip-nat-workadventure", true);
    vpc.addEip(eip);

    const natGateway: NatGateway = new NatGateway("nat-1-workadventure", true, eip);
    subnetPublicA.addNatGateway(natGateway);

    const routeTablePublic: RouteTable = new RouteTable("route-table-public");
    const routeTablePrivate: RouteTable = new RouteTable("route-table-private");

    vpc.addRouteTable(routeTablePublic);
    vpc.addRouteTable(routeTablePrivate);

    routeTablePublic.addRoute({
        destinationCidr: "0.0.0.0/0", 
        targetType: TargetType.InternetGateway, 
        target: {targetInternetGateway: internetGateway}
    });

    routeTablePublic.addAssociation({
        target: subnetPublicA
    });

    routeTablePublic.addAssociation({
        target: subnetPublicB
    });

    routeTablePrivate.addRoute({
        destinationCidr: "0.0.0.0/0", 
        targetType: TargetType.NatGateway, 
        target: {targetNatGateway: natGateway}
    });

    routeTablePrivate.addAssociation({
        target: subnetPrivateA
    });

    routeTablePrivate.addAssociation({
        target: subnetPrivateB
    });

    const defaultSecurityGroup: SecurityGroup = new SecurityGroup(
        "default-sg", 
        "Default security group that allows all inbound & outbound trafic",
    );
    
    const defaultRule: Rule = {
        cidrBlocks: ["0.0.0.0/0"],
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
    };

    defaultSecurityGroup.addInboundRule(defaultRule);
    defaultSecurityGroup.addOutboundRule(defaultRule);

    vpc.addSecurityGroup(defaultSecurityGroup);

    vpcRepository.deploy(vpc);
    return vpc;
}