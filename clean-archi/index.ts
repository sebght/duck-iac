import { AzureNetworkRepository } from "./repository/AzureNetworkRepository";
import { AwsVpcRepository } from "./repository/AwsVpcRepository";
import { AwsLoadBalancerRepository } from "./repository/AwsLoadBalancerRepository";
import { AwsContainerServiceRepository } from "./repository/AwsContainerServiceRepository";
import { CreerUnReseau } from "./usecases/CreerUnReseau";
import { DeployerLoadBalancer } from "./usecases/DeployerLoadBalancer";
import { DeployerWorkAdventure } from "./usecases/DeployerWorkAdventure";

// PoC multi-cloud
// const azureNetworkRepository = new AzureNetworkRepository();
// CreerUnReseau(azureNetworkRepository);

// Deployer WorkAdventure
const awsVpcRepository = new AwsVpcRepository();
const awsLoadBalancerRepository = new AwsLoadBalancerRepository();
const awsContainerServiceRepository = new AwsContainerServiceRepository();

const vpc = CreerUnReseau(awsVpcRepository);
DeployerLoadBalancer(awsLoadBalancerRepository, awsVpcRepository, vpc);
DeployerWorkAdventure(awsLoadBalancerRepository, awsVpcRepository, awsContainerServiceRepository);
