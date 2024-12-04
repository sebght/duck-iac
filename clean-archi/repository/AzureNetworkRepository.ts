import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import * as compute from "@pulumi/azure-native/compute";
import * as network from "@pulumi/azure-native/network";
import * as resources from "@pulumi/azure-native/resources";

import { Vpc } from "../domain/vpc/vpc";
import { IVpcRepository } from "./IVpcRepository";

export class AzureNetworkRepository implements IVpcRepository{
    private vpcResourceMap: Map<string, any>;
    constructor() { this.vpcResourceMap = new Map<string, any>(); }

    private AddResource(resourceName: string, resourceType: any): void {
        this.vpcResourceMap.set(resourceName, resourceType);
    }

    public GetDeployedResource(resourceName: string): any {
        // gerer les exceptions, par exemple, s'il n'existe pas une resource avec ce nom (resourceMap.has())
        return this.vpcResourceMap.get(resourceName);
    }

    public deploy(vpc: Vpc): void {
        // All resources will share a resource group.
        const resourceGroupName = new resources.ResourceGroup("server-rg").name;

        // Create a network and subnet for all VMs.
        const virtualNetwork = new network.VirtualNetwork("server-network", {
            resourceGroupName,
            addressSpace: { addressPrefixes: ["10.0.0.0/16"] },
            subnets: [{
                name: "default",
                addressPrefix: "10.0.1.0/24",
            }],
        });

        // Now allocate a public IP and assign it to our NIC.
        const publicIp = new network.PublicIPAddress("server-ip", {
            resourceGroupName,
            publicIPAllocationMethod: network.IPAllocationMethod.Dynamic,
        });

        const networkInterface = new network.NetworkInterface("server-nic", {
            resourceGroupName,
            ipConfigurations: [{
                name: "webserveripcfg",
                subnet: virtualNetwork.subnets.apply(subnet => subnet![0]),
                privateIPAllocationMethod: network.IPAllocationMethod.Dynamic,
                publicIPAddress: { id: publicIp.id },
            }],
        });

        // Now create the VM, using the resource group and NIC allocated above.
        const vm = new compute.VirtualMachine("server-vm", {
            resourceGroupName,
            networkProfile: {
                networkInterfaces: [{ id: networkInterface.id }],
            },
            hardwareProfile: {
                vmSize: compute.VirtualMachineSizeTypes.Standard_A1_v2,
            },
            osProfile: {
                computerName: "hostname",
                adminUsername: "ubuntu",
                linuxConfiguration: {
                    disablePasswordAuthentication: true,
                    ssh: {
                        publicKeys: [{
                            keyData: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC+v6F5GBeMxC6CXhSK6NGd21k0Hi0UKXlwCKeMNB6Iy7Ij44P7z23QJs0e5daocNL1u+YrxAE8YVjklJnKjYNEXCGfprKDa58b7IaBYi+EknSPeXac0RtpZZnKoDieoGVo5l/Mqr+pKqWp0ofVn65tjw8crMLPq8Wd+k+zMKnFKCEXFHhaCzbU+03O4WJFHNVXHLG/B85+6i8l0xlA/SGUsIVLUnSPu6kw8HENGHjh1peaShczemFFHdHiz4iZUK8wISaJxH4KOeRrFAik6sSkaz98irvn+siAmgRYbRGtXP3zZ7vbojS4gvLOV6KkOsjPoaoYCnGsjnic8WNUOsiD r.cisneros.araujo@AMAC02G45GGML85",
                            path: "/home/ubuntu/.ssh/authorized_keys",
                        }],
                    },
                },
            },
            storageProfile: {
                osDisk: {
                    createOption: compute.DiskCreateOption.FromImage,
                    name: "myosdisk1",
                },
                imageReference: {
                    publisher: "canonical",
                    offer: "UbuntuServer",
                    sku: "16.04-LTS",
                    version: "latest",
                },
            },
            vmName: "RICI-VM"
        });

        // The public IP address is not allocated until the VM is running, so wait for that
        // resource to create, and then lookup the IP address again to report its public IP.
        const ipAddress = vm.id.apply(_ => network.getPublicIPAddressOutput({
            resourceGroupName: resourceGroupName,
            publicIpAddressName: publicIp.name,
        })).ipAddress;
        
        console.log(ipAddress);
    }
}
