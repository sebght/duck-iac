import {IProgram, StackDependency} from "../tools/layer";
import {PolicyDocument} from "@pulumi/aws/iam";
import {AwsS3Repository} from "../repository/AwsS3Repository";

export class SiteStatiqueWebSurS3 implements IProgram {
    public plugins: StackDependency[];
    constructor(plugins: StackDependency[]) {
        this.plugins = plugins
    }
    public name(): string {
        return "site-web"
    };
    public async run() {
        const awsS3Repository = new AwsS3Repository()
        const indexContent = `<html><head>
<title>Hello S3</title><meta charset="UTF-8">
</head>
<body><p>Hello, world!</p><p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a></p>
</body></html>
`
        const siteBucket = awsS3Repository.creerUnBucketDeTypeWebsite("s3-website-bucket", "index.html", indexContent)

        const publicReadPolicyForBucket = siteBucket.bucket.apply(bucketName => ({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: "*",
                    Action: [
                        "s3:GetObject"
                    ],
                    Resource: [
                        `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
                    ],
                    Condition: {
                        StringEquals: {
                            "aws:PrincipalOrgID": ["o-aa111bb222"]
                        }
                    }
                }]
        } as PolicyDocument))
        awsS3Repository.appliqueUnePolicy(siteBucket, publicReadPolicyForBucket)

        return {
            websiteUrl: siteBucket.websiteEndpoint,
        };
    };
}