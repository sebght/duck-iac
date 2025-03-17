import { ContainerFactory, ContainerLayerFactoryFuncType } from "../usecases/container/ContainerFactory"
import { ContainerInput } from "../usecases/container/inout"
import { DatabaseFactory, DatabaseLayerFactoryFuncType } from "../usecases/database/DatabaseFactory"
import { DatabaseInput } from "../usecases/database/inout"

type ProjectBuilderOpt = {
  withContainer: boolean
  withDb: boolean
}

class ProjectBuilder {
  private _options: ProjectBuilderOpt

  private _env: string
  private _project: string

  private _databaseLayerFactory: DatabaseLayerFactoryFuncType
  private _databaseInputs: DatabaseInput

  private _containerLayerFactory: ContainerLayerFactoryFuncType
  private _containerInputs: ContainerInput

  constructor(project: string, env: string) {
    this._project = project
    this._env = env
    this._options = {
      withContainer: false,
      withDb: false
    }
  }

  public async Up() {

    let consoleLog = ""

    if (this._options.withContainer) {
      const l = await this._containerLayerFactory(this._project, this._env)
      await l.setInputs(this._containerInputs)

      await l.up()
      const outputs = await l.getOuputs()

      consoleLog = consoleLog.concat(`containerUrl: ${outputs.url}\n`)
      consoleLog = consoleLog.concat(`[${this._project}] ${this._containerInputs.image} on ${this._env} deployed.\n`)
    } else {
      const l = await this._containerLayerFactory(this._project, this._env)
      await l.down()
    }

    if (this._options.withDb) {
      const l = await this._databaseLayerFactory(this._project, this._env)
      await l.setInputs(this._databaseInputs)
      await l.up()
      const outputs = await l.getOuputs()
      consoleLog = consoleLog.concat(`databaseUrl: ${outputs.dbString}\n`)
    } else {
      const l = await this._databaseLayerFactory(this._project, this._env)
      await l.down()
    }

    console.log(consoleLog)
  }

  public async Down() {
    if (this._options.withContainer) {
      const l = await this._containerLayerFactory(this._project, this._env)
      await l.down()
    }

    if (this._options.withDb) {
      const l = await this._databaseLayerFactory(this._project, this._env)
      await l.down()
    }
  }

  public WithCloud(cloud: string): ProjectBuilder {
    if (cloud == "") {
      cloud = "scw"
    }

    this._containerLayerFactory = ContainerFactory(cloud)
    this._databaseLayerFactory = DatabaseFactory(cloud)

    return this
  }

  public WithContainer(c: ContainerInput): ProjectBuilder {
    this._options.withContainer = true
    this._containerInputs = c
    return this
  }

  public WithDb(db: DatabaseInput): ProjectBuilder {
    this._options.withDb = true
    this._databaseInputs = db

    return this
  }
}

export function deployProject(options: any) {
  const project = new ProjectBuilder(options.project, options.env)
  project
    .WithCloud(options.cloud)
    .WithContainer({
      project: options.project,
      image: options.image,
      port: options.port,
      envs: options.envVars
    })

  if (options.db) {
    project.WithDb({ name: "name" })
  }

  project.Up()
}

export function destroyProject(options: any) {
  const project = new ProjectBuilder(options.project, options.env)
  project
    .WithCloud(options.cloud)
    .WithContainer({
      project: options.project,
      image: options.image,
      port: options.port,
    })

  if (options.db) {
    project.WithDb({ name: "name" })
  }
  project.Down()
}

