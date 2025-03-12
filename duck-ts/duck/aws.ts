import { NewAwsContainerLayer } from "../usecases/container/AContainerOnAwsFargate";


export async function deployAwsContainer(options: any) {
  console.log(`[${options.project}] Deploying ${options.image} on ${options.env}...`)

  const p = NewAwsContainerLayer(`${options.project}-${options.env}`)

  await p.setInputs({
    project: options.project,
    image: options.image,
    port: options.port
  })

  await p.up()

  const outputs = await p.getOuputs()
  console.log(`URL: ${outputs.url}`)
  console.log(`[${options.project}] ${options.image} on ${options.env} deployed.`)
}

export async function destroyAwsContainer(options: any) {
  console.log(`[${options.project}] Destroying ${options.image} on ${options.env}...`)

  const p = NewAwsContainerLayer(`${options.project}-${options.env}`)

  await p.down()
  console.log(`[${options.project}] ${options.image} on ${options.env} destroyed.`)
}
