import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { ServiceAccount } from "@cdktf/provider-google/lib/service-account";
import { App, GcsBackend, TerraformStack } from "cdktf";
import { Construct } from "constructs";

const PROJECT_NAME = "cdktf-ts-poc";
const REMOTE_BACKEND = "cdktf-remote-backend"; //PROJECT_NAME + "-terraform-state";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const provider = new GoogleProvider(this, "google", {
      project: PROJECT_NAME,
    });

    new ServiceAccount(this, "Generate service account", {
      provider: provider,
      accountId: PROJECT_NAME + "-terraform",
      displayName: PROJECT_NAME + "-terraform",
    });

    new GcsBackend(this, {
      bucket: REMOTE_BACKEND,
      prefix: "state",
    });
  }
}

const app = new App();
new MyStack(app, "cdktf-poc");
app.synth();
