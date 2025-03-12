import { Layer } from "../../tools/layer";
import { IProgram } from "../../tools/program";
import { AwsECSRepository } from "../../repository/aws/AwsECSRepository";
import { ContainerInput, ContainerOutput } from "./inout";
import { RequireInputs } from "../../tools/input";
import * as pulumi from "@pulumi/pulumi";


export async function NewAwsContainerLayer(stackName: string): Promise<Layer<ContainerInput, ContainerOutput>> {
  const p = new AwsContainerProgram()
  const l = new Layer<ContainerInput, ContainerOutput>(stackName, p)
  await l.init()

  return l
}
export class AwsContainerProgram implements IProgram {
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

  public async run(): Promise<pulumi.Output<ContainerOutput>> {

    const inputs = RequireInputs<ContainerInput>()

    const awsECSRepository = new AwsECSRepository()
    const publiclyExposed: boolean = true
    awsECSRepository.newService(
      inputs.project,
      inputs.image,
      inputs.port,
      publiclyExposed
    )
    return pulumi.output({
      url: awsECSRepository.domain
    })
  };
}
