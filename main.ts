import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { CloudRunService } from "@cdktf/provider-google/lib/cloud-run-service";
import { DataGoogleIamPolicy } from "@cdktf/provider-google/lib/data-google-iam-policy";
import { CloudRunServiceIamPolicy } from "@cdktf/provider-google/lib/cloud-run-service-iam-policy";

   const LOCAL = "asia-northeast1";
   const PROJECT_NAME = "cdktf-ts-poc"; 

class MyStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        new GoogleProvider(this, "google", {
            project: PROJECT_NAME
        });

         const cloudrunsvcapp = new CloudRunService(this, "GcpCDKCloudrunsvc", {
            location: LOCAL,
            name: "gcpcdktfcloudrunsvc2020",
            template: {
                spec: {
                containers: [
                    {
                    image: "gcr.io/cloudrun/hello",
                    },
                ],
                },
            },
        });
        const policy_data = new DataGoogleIamPolicy(this, "datanoauth", {
            binding: [
                {
                role: "roles/run.invoker",
                members: ["allUsers"],
                },
            ],
        });
        new CloudRunServiceIamPolicy(this, "runsvciampolicy", {
            location: LOCAL,
            project: cloudrunsvcapp.project,
            service: cloudrunsvcapp.name,
            policyData: policy_data.policyData,
        });
    }
}

const app = new App();
new MyStack(app, "cdktf-poc");
app.synth();
