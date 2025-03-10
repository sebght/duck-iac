import { Layer } from "../../tools/layer";
import { IProgram } from "../../tools/program";
import { AwsECSRepository } from "../../repository/aws/AwsECSRepository";
import { ContainerInput, ContainerOutput } from "./inout";
import { RequireInputs } from "../../tools/input";


export function NewAwsEcsFargateContainer(stackName: string): Layer<ContainerInput, ContainerOutput> {
  const p = new AwsEcsFargateContainer()
  const l = new Layer<ContainerInput, ContainerOutput>(stackName, p)
  l.init()

  return l
}
export class AwsEcsFargateContainer implements IProgram {
  constructor() { }
  public plugins() {
    return [
      {
        name: "awsx",
        version: "2.21.0",
        url: "github.com/pulumi/pulumi-awsx",
      },
      {
        name: "aws",
        version: "6.70.0",
        url: "github.com/pulumi/pulumi-aws",
      },
    ]
  };

  public name(): string {
    return "aws-ecs-fargate-container"
  };

  public async run() {

    const inputs = RequireInputs<ContainerInput>()

    const awsECSRepository = new AwsECSRepository()
    const exposePubliquement: boolean = true
    const loadBalancerUrl = awsECSRepository.simple(inputs.image, exposePubliquement)
    return { url: loadBalancerUrl };
  };
}
