import * as pulumi from "@pulumi/pulumi"

export function RequireInputs<I>(): I {
  const cfg = new pulumi.Config()
  return cfg.requireObject<I>("inputs")
}
