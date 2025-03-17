
export type ContainerInput = {
  project: string
  image: string
  port: number
  envs?: { [key: string]: string }
}

export type ContainerOutput = {
  url: string
}
