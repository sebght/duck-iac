export const tagOwner: string = "RICI";
export const defaultTags: {[name: string]: string} = {
    Name: "WorkAdventure - " + tagOwner,
    Owner: tagOwner
}

/**
 * Fonction qui retourne un objet tag avec le nom de la resource qu'on souhaite.
 * Example : pour un resource "vpc", la fonction retourne : 
 * {
 *   Name: vpc - RICI
 *   Owner: RICI
 * }
 * @param resourceName Le nom de la resource
 * @returns un objet avec deux tags : Name et Owner
 */
export function GetTagWithResourceName(resourceName: string): {[name: string]: string}  {
    return {
        Name: resourceName + " - " + tagOwner,
        Owner: tagOwner
    }
}