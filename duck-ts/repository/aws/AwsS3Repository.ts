import { s3 } from "@pulumi/aws";
import { PolicyDocument } from "@pulumi/aws/iam";
import { Input } from "@pulumi/pulumi";

export class AwsS3Repository {
  public async creerUnBucketSimple(name: string) {
    new s3.Bucket(name);
  }

  public creerUnBucketDeTypeWebsite(name: string, indexPath: string, indexContent: string): s3.Bucket {
    const siteBucket = new s3.Bucket(name, {
      website: {
        indexDocument: indexPath,
      },
    });
    new s3.BucketObject("index", {
      bucket: siteBucket,
      content: indexContent,
      contentType: "text/html; charset=utf-8",
      key: indexPath
    });
    return siteBucket
  }

  public appliqueUnePolicy(bucket: s3.Bucket, policy: Input<PolicyDocument>): void {
    new s3.BucketPolicy("bucketPolicy", {
      bucket: bucket.bucket,
      policy: policy
    });
  }
}
