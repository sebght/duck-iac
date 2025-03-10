import { NewScwContainerProgram } from "../usecases/container/ScwContainer";
import { NewAwsEcsFargateContainer } from "../usecases/container/AwsEcsFargateContainer";
import { NewGcpContainerLayer } from "../usecases/container/AContainerOnGcpCloudRun";
import { ContainerInput, ContainerOutput } from "../usecases/container/inout";
import { Layer } from "../tools/layer";


function selectCloud(cloud: string, project: string, env: string): Layer<ContainerInput, ContainerOutput> {
  switch (cloud) {
    case "scw":
      return NewScwContainerProgram(`${project}-${env}`)
    case "aws":
      return NewAwsEcsFargateContainer(`${project}-${env}`)
    case "gcp":
      return NewGcpContainerLayer(`${project}-${env}`)
  }
}

export async function deployContainer(options: any) {
  console.log(`[${options.project}] Deploying ${options.image} on ${options.env}...`)

  const p = selectCloud(options.cloud, options.project, options.env)

  await p.setInputs({
    image: options.image,
    name: options.name,
    port: options.port
  })

  await p.up()

  const outputs = await p.getOuputs()
  console.log(`containerUrl: ${outputs.url}`)
  console.log(`[${options.project}] ${options.image} on ${options.env} deployed.`)
}

export async function destroyContainer(options: any) {
  console.log(`[${options.project}] Destroying ${options.image} on ${options.env}...`)

  const p = selectCloud(options.cloud, options.project, options.env)

  await p.down()
  console.log(`[${options.project}] ${options.image} on ${options.env} destroyed.`)
}
