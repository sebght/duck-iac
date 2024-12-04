/** Chez AWS, une EIP peut exister sans être liée à un VPC (voilà l'interet de l'attribut isInVpc).
 * Néanmoins, l'implémentation déploie uniquement les Eips qui appartient à un VPC.
 * Une solution pourrait être qu'on envoie l'objet Eip quand on appelle la fonction deploy() de la classe vpcRepository.
*/
export class Eip {
    private name: string;
    private isInVpc: boolean;
 
    // list des nat
    
    constructor(name: string, isInVpc: boolean = false) {
        this.name = name;
        this.isInVpc = isInVpc;
    }

    public getName(): string {
        return this.name;
    }

    public IsInVpc(): boolean {
        return this.isInVpc;
    }
}