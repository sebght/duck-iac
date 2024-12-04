type ValidationMethod = "NONE" | "EMAIL" | "DNS";

export class Certificate {
    private domainName: string;
    private validationMethod: ValidationMethod;

    constructor(domainName: string, validationMethod: ValidationMethod = "NONE") {
        this.domainName = domainName;
        this.validationMethod = validationMethod;
    }

    public getDomainName(): string {
        return this.domainName;
    }

    public getValidationMethod(): string {
        return this.validationMethod;
    }
}