import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { ServiceAccount } from "@cdktf/provider-google/lib/service-account";
import { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket";
import { StorageBucketIamBinding } from "@cdktf/provider-google/lib/storage-bucket-iam-binding";
import { App, GcsBackend, TerraformStack } from "cdktf";
import { Construct } from "constructs";

const LOCAL = "asia-northeast1";
const PROJECT_NAME = "cdktf-ts-poc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const provider = new GoogleProvider(this, "google", {
      project: PROJECT_NAME,
    });

    // リモートバックエンドの指定
    new GcsBackend(this, {
      bucket: "cdktf-remote-backend",
      prefix: "state",
    });

    // サービスアカウントの作成
    const serviceAccount = new ServiceAccount(
      this,
      "Generate Service Account",
      {
        provider: provider,
        accountId: "cdktf-example-service-account",
        displayName: "cdktf-example-service-account",
      }
    );

    // GCSバケット作成
    const bucket = new StorageBucket(this, "Generate GCS Bucket", {
      provider: provider,
      location: LOCAL,
      name: "aaaa-aaaa-a",
      uniformBucketLevelAccess: true,
      dependsOn: [serviceAccount],
    });

    // GCSバケットへの権限追加
    new StorageBucketIamBinding(
      this,
      "Add role roles/storage.legacyBucketReader",
      {
        provider: provider,
        bucket: bucket.name,
        role: "roles/storage.legacyBucketReader",
        members: [`serviceAccount:${serviceAccount.email}`],
        dependsOn: [serviceAccount, bucket],
      }
    );

    // オブジェクトへの権限追加
    new StorageBucketIamBinding(this, "Add role roles/storage.objectViewer", {
      provider: provider,
      bucket: bucket.name,
      role: "roles/storage.objectViewer",
      members: [`serviceAccount:${serviceAccount.email}`],
      dependsOn: [serviceAccount, bucket],
    });
  }
}

const app = new App();
new MyStack(app, "cdktf-poc");
app.synth();
