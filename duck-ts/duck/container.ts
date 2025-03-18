import {NewScwContainerLayer} from "../usecases/container/AContainerOnScw";
import {NewAwsContainerLayer} from "../usecases/container/AContainerOnAwsFargate";
import {NewGcpContainerLayer} from "../usecases/container/AContainerOnGcpCloudRun";
import {ContainerInput, ContainerOutput} from "../usecases/container/inout";
import {Layer} from "../tools/layer";


async function selectCloud(cloud: string, project: string, env: string): Promise<Layer<ContainerInput, ContainerOutput>> {
  switch (cloud) {
    case "scw":
      return NewScwContainerLayer(`${project}-${env}`)
    case "aws":
      return NewAwsContainerLayer(`${project}-${env}`)
    case "gcp":
      return NewGcpContainerLayer(`${project}-${env}`)
  }
}

export async function deployContainer(options: any) {
  console.log(`[${options.project}] Deploying ${options.image} on ${options.env}...`)

  const p = await selectCloud(options.cloud, options.project, options.env)

  await p.setInputs({
    image: options.image,
    project: options.project,
    port: options.port
  })

  await p.up()

  const outputs = await p.getOuputs()
  console.log(`containerUrl: ${outputs.url}`)
  console.log(`[${options.project}] ${options.image} on ${options.env} deployed.`)
}

export async function getContainerOutputs(options: any): Promise<ContainerOutput> {
  const p = await selectCloud(options.cloud, options.project, options.env)

  await p.setInputs({
    image: options.image,
    project: options.project,
    port: options.port
  })
  return await p.getOuputs()
}

export async function destroyContainer(options: any) {
  console.log(`[${options.project}] Destroying ${options.image} on ${options.env}...`)

  const p = await selectCloud(options.cloud, options.project, options.env)

  await p.down()
  console.log(`[${options.project}] ${options.image} on ${options.env} destroyed.`)
}
