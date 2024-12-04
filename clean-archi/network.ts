import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export class Network {
    private securityGroup: Array<aws.ec2.SecurityGroup>;
    private subnet: Array<aws.ec2.Subnet>;
    private vpc: aws.ec2.Vpc;

    constructor(vpcCIDR: pulumi.Input<string>) {
        this.securityGroup = [];
        this.subnet = [];

        this.vpc = new aws.ec2.Vpc(name, {
            cidrBlock: vpcCIDR,
            tags: defaultTags
        });
        
        const subnetPublicA = new aws.ec2.Subnet("public_a", {
            vpcId: this.vpc.id,
            availabilityZone: "eu-west-3a",
            cidrBlock: "10.0.0.0/24",
            tags: {
                Name: "Public A",
                Owner: owner
            }    
        });
    
        const subnetPublicB = new aws.ec2.Subnet("public_b", {
            vpcId: this.vpc.id,
            availabilityZone: "eu-west-3b",
            cidrBlock: "10.0.1.0/24",
            tags: {
                Name: "Public B",
                Owner: owner
            }    
        });
    
        const subnetPrivateA = new aws.ec2.Subnet("private_a", {
            vpcId: this.vpc.id,
            availabilityZone: "eu-west-3a",
            cidrBlock: "10.0.2.0/24",
            tags: {
                Name: "Private A",
                Owner: owner
            }    
        });
    
        const subnetPrivateB = new aws.ec2.Subnet("private_b", {
            vpcId: this.vpc.id,
            availabilityZone: "eu-west-3b",
            cidrBlock: "10.0.3.0/24",
            tags: {
                Name: "Private B",
                Owner: owner
            }    
        });
        this.addSubnet(subnetPublicA); // 0
        this.addSubnet(subnetPublicB);
        this.addSubnet(subnetPrivateA);
        this.addSubnet(subnetPrivateB); // 3
    
        
        const gateway = new aws.ec2.InternetGateway(name, {
            vpcId: this.vpc.id,
            tags: defaultTags
        });
        
        const eip = new aws.ec2.Eip(name, {
            vpc: true,
            tags: defaultTags
        });
    
        const nat = new aws.ec2.NatGateway(name, {
            allocationId: eip.id,
            subnetId: subnetPublicA.id,
            tags: {
                Name: "NAT Public A",
                Owner: owner
            }
        });
        
        const routeTablePublic = new aws.ec2.RouteTable("routeTablePublic", {
            vpcId: this.vpc.id,
            routes : [{
                cidrBlock: anyoneCIDR,
                gatewayId: gateway.id
            }],
            tags: defaultTags
        });
    
        const routeTablePrivate = new aws.ec2.RouteTable("routeTablePrivate", {
            vpcId: this.vpc.id,
            routes : [{
                cidrBlock: anyoneCIDR,
                natGatewayId: nat.id
            }],
            tags: defaultTags
        });
    
        const routePublicA = new aws.ec2.RouteTableAssociation("routePublicA", {
            subnetId: subnetPublicA.id,
            routeTableId: routeTablePublic.id
        });
    
        const routePublicB = new aws.ec2.RouteTableAssociation("routePublicB", {
            subnetId: subnetPublicB.id,
            routeTableId: routeTablePublic.id
        });
    
        const routePrivateA = new aws.ec2.RouteTableAssociation("routePrivateA", {
            subnetId: subnetPrivateA.id,
            routeTableId: routeTablePrivate.id
        });
    
        const routePrivateB = new aws.ec2.RouteTableAssociation("routePrivateB", {
            subnetId: subnetPrivateB.id,
            routeTableId: routeTablePrivate.id
        });
        
        const securityGroup = new aws.ec2.SecurityGroup(name, {
            vpcId: this.vpc.id,
            ingress: [
                {
                    cidrBlocks: [ anyoneCIDR ],
                    fromPort: 0,
                    toPort: 0,
                    protocol: "-1",
                },
            ],
            egress: [{
                cidrBlocks: [ anyoneCIDR ],
                fromPort: 0,
                toPort: 0,
                protocol: "-1",
            }],
        });
    
        this.addSG(securityGroup);
    
    }

    addSG(value: aws.ec2.SecurityGroup): void {
        this.securityGroup.push(value);
    }

    addSubnet(value: aws.ec2.Subnet): void {
        this.subnet.push(value);
    }

    addVpc(value: aws.ec2.Vpc) {
        this.vpc = value;
    }

    getSG(index: number): aws.ec2.SecurityGroup {
        return this.securityGroup[index];
    }

    getSubnet(index: number): aws.ec2.Subnet {
        return this.subnet[index];
    }

    getVpc(): aws.ec2.Vpc {
        return this.vpc;
    }
}

const anyoneCIDR: string = "0.0.0.0/0";
const name: string = "ECS - Workadventure";
const owner: string = "RICI";
const defaultTags: {[name: string]: string} = {
    Name: name,
    Owner: owner
}
    