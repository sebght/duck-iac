import { NewScwContainerLayer } from "../usecases/container/AContainerOnScw";

export async function deployScwContainer(options: any) {
  console.log(`[${options.project}] Deploying ${options.image} on ${options.env}...`)

  const p = await NewScwContainerLayer(`${options.project}-${options.env}`)

  await p.setInputs({
    image: options.image,
    project: options.project,
    port: options.port
  })

  await p.up()

  const outputs = await p.getOuputs()
  console.log(`contrinerUrl: ${outputs.url}`)
  console.log(`[${options.project}] ${options.image} on ${options.env} deployed.`)
}

export async function destroyScwContainer(options: any) {
  console.log(`[${options.project}] Destroying ${options.image} on ${options.env}...`)

  const p = await NewScwContainerLayer(`${options.project}-${options.env}`)

  await p.down()
  console.log(`[${options.project}] ${options.image} on ${options.env} destroyed.`)
}
