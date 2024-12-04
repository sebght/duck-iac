import { expect } from "chai";
import { Vpc } from "../../../domain/vpc/vpc";
import { Subnet } from "../../../domain/vpc/subnet";

describe("Vpc", () => {
    describe("Constructeur", () => {
        it("Initialise un objet Vpc nominal", () => {
            // given
            const name = "vpc-test";
            const cidrBlock = "10.0.0.0/16";
            // when
            const vpc = new Vpc(name, cidrBlock)
            
            // then
            expect(vpc).to.have.property("name")
            expect(vpc.getName()).to.equal("vpc-test")
            expect(vpc).to.have.property("cidrBlock")
            expect(vpc.getCidrBlock()).to.equal("10.0.0.0/16")
            expect(vpc).to.have.property("subnets")
            expect(vpc.subnets).to.have.length(0)
        })
    
        it("Vérifie le constructeur sans le parametre cidrBlock", () => {
            // given
            const name = "vpc-test";
        
            // when
            const vpc = new Vpc(name)
            
            // then
            expect(vpc).to.have.property("cidrBlock", undefined)
        })
    })

    describe("addSubnet", () => {
        it("Ajoute correctement un subnet dans la liste", () => {
            // given
            const name = "vpc-test";
            const subnet = new Subnet("test-subnet")
            const vpc = new Vpc(name)

            // when
            vpc.addSubnet(subnet)
            
            // then
            expect(vpc).to.have.property("subnets")
            expect(vpc.subnets).to.have.length(1)
            expect(vpc.subnets).to.include(subnet)

        })

        it("Ajoute correctement deux subnets dans la liste", () => {
            // given
            const name = "vpc-test";
            const subnet1 = new Subnet("test-subnet1")
            const subnet2 = new Subnet("test-subnet2")
            const vpc = new Vpc(name)

            // when
            vpc.addSubnet(subnet1)
            vpc.addSubnet(subnet2)

            
            // then
            expect(vpc).to.have.property("subnets")
            expect(vpc.subnets).to.have.length(2)
            expect(vpc.subnets).to.include(subnet1)
            expect(vpc.subnets).to.include(subnet2)
  
        })
    })
    
})