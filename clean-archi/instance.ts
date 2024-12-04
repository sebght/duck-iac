import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function CreateInstance(
    instanceName: string,
    instanceType: pulumi.Input<string>,
    instanceOwners: string[],
    subnetId: pulumi.Input<string>,
    securityGroupIds: pulumi.Input<string>[],
    publicKey : pulumi.Input<string>
) : aws.ec2.Instance {
    const ami = pulumi.output(aws.ec2.getAmi({
        owners: instanceOwners,
        mostRecent: true,
        filters: [
            { name   : "root-device-type", values : ["ebs"] },
            { name   : "architecture", values : ["x86_64"]}, 
            { name   : "virtualization-type", values : ["hvm"]}
        ],
    }));

    const keyPair = new aws.ec2.KeyPair(instanceName + "keypair", {
        publicKey: publicKey
    });

    const instance = new aws.ec2.Instance(instanceName, {
        ami: ami.id,
        instanceType: instanceType,
        subnetId: subnetId,
        vpcSecurityGroupIds: securityGroupIds,
        keyName: publicKey
    });

    return instance;
}