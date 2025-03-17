
import * as scw from "@pulumiverse/scaleway";
import * as random from "@pulumi/random"
import { Output } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";

export enum ScwDatabaseSize {
  DB_DEV_S = "DB-DEV-S"
}

export class ScwDatabaseRepository {
  private _instance: scw.DatabaseInstance
  private _db: scw.Database

  public newDatabase(name: string, nodeType: ScwDatabaseSize): void {
    const username = new random.RandomPet(`${name}-username`)
    const password = new random.RandomPassword(`${name}-password`, {
      length: 22,
      minLower: 2,
      minNumeric: 2,
      minSpecial: 2,
      minUpper: 2,
    })

    this._instance = new scw.DatabaseInstance(`${name}-instance`, {
      name: name,
      engine: "PostgreSQL-16",
      nodeType,
      isHaCluster: false,
      disableBackup: true,
      userName: username.id,
      password: password.result,
    })

  }

  get publicConnectionString(): Output<string> | string {
    const uri = pulumi.all([
      this._instance.userName,
      this._instance.password,
      this._instance.loadBalancers[0].ip,
      this._instance.loadBalancers[0].port,
    ]).apply(([
      username,
      password,
      hostname,
      port,
    ]) => `postgres://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostname}:${port}/rdb`
    )
    return uri
  }

  public privateConnectionString(): Output<string> {
    return pulumi.all([
      this._instance.userName,
      this._instance.password,
      this._instance.privateNetwork.hostname,
      this._instance.privateNetwork.port,
      this._db.name,
    ]).apply(([
      username,
      password,
      hostname,
      port,
      dbName
    ]) => {
      return `postgres://${username}:${password}@${hostname}:${port}/${dbName}`
    }
    )
  }
}
