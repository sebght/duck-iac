import { expect } from "chai";
import { Eip } from "../../../domain/vpc/Eip";

describe("Eip", () => {
    it("Initialise un objet Eip nominal", () => {
        // given
        const name = "eip-test";
        const isInVpc = true;
        // when
        const eip = new Eip(name, isInVpc)
        
        // then
        expect(eip).to.have.property("name")
        expect(eip.getName()).to.equal("eip-test")
        expect(eip).to.have.property("isInVpc")
        expect(eip.IsInVpc()).to.equal(true)

    })

    it("Utilise la valeur par défaut pour l'attribut isInVpc", () => {
        // given
        const name = "eip-test";
        // when
        const eip = new Eip(name)
        
        // then
        expect(eip).to.have.property("name")
        expect(eip.getName()).to.equal("eip-test")
        expect(eip).to.have.property("isInVpc")
        expect(eip.IsInVpc()).to.equal(false)

    })

})