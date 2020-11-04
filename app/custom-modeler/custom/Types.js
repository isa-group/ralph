export const label = [
    'custom:Resource',
    'custom:ResourceAbsence',
    'custom:Role',
    'custom:RoleAbsence',
    'custom:Group',
    'custom:GroupAbsence',
    'custom:Clock',
    'custom:TimeSlot',
    'custom:nyanCat',
    'custom:Person',
    'custom:RoleRALph',
    'custom:Personcap',
    'custom:Orgunit',
    'custom:Position'
]

export const externalLabel = [
    'custom:Resource',
    'custom:ResourceAbsence',
    'custom:Role',
    'custom:RoleAbsence',
    'custom:Group',
    'custom:GroupAbsence',
    'custom:Clock',
    'custom:nyanCat',
    'custom:Person',
    'custom:RoleRALph',
    //'custom:Personcap'
    
    
]

export const connections = [
    'custom:ResourceArc',
    'custom:ResourceArc2',
    'custom:ConsequenceFlow',
    'custom:TimeDistanceArcStart',
    'custom:TimeDistanceArcEnd'
]

export const directEdit = [
    // 'custom:Resource',
    // 'custom:Role',
    // 'custom:Group',
    'custom:Clock',
    'custom:TimeSlot',
    'custom:nyanCat',
    'custom:Person',
    'custom:RoleRALph',
    'custom:Personcap',
    'custom:Orgunit',
    'custom:Position'
]

export const resourceArcElements = [
    'custom:Clock',
    'custom:Resource',
    'custom:ResourceAbsence',
    'custom:Role',
    'custom:RoleAbsence',
    'custom:Group',
    'custom:GroupAbsence',
    'custom:TimeSlot',
    'custom:nyanCat',
    'custom:Person',
    'custom:RoleRALph',
    'custom:Personcap',
    'custom:Orgunit',
    //'custom:Position'
    'custom:Position'
]

export const resourceArcElements2 = [
    'custom:Position'
]

export const custom = [
    'custom:Clock',
    'custom:Resource',
    'custom:ResourceAbsence',
    'custom:Role',
    'custom:RoleAbsence',
    'custom:Group',
    'custom:GroupAbsence',
    'custom:TimeSlot',
    'custom:ResourceArc',
    'custom:ResourceArc2',
    'custom:ConsequenceFlow',
    'custom:TimeDistanceArcStart',
    'custom:TimeDistanceArcEnd',
    'custom:nyanCat',
    'custom:Person',
    'custom:RoleRALph',
    'custom:Personcap',
    'custom:Orgunit',
    'custom:Position'
]

export function isCustomShape(type) {
    if (typeof type === 'object')
        type = type.type

    return type.includes('custom:') && !connections.includes(type)
}

export function isCustomConnection(type) {
    if (typeof type === 'object') {
        type = type.type
    }
    return type.includes('custom:') && connections.includes(type)
}

export function isCustomResourceArcElement(type) {
   /* if (typeof type === 'object') {
        type = type.type
    }*/
    
    if (type.type!="custom:Position"){
        type=type.type
    }

    return resourceArcElements.includes(type)
}


export function isCustomResourceArc2Element(type) {
 
     if (type.type === "custom:Position"){
         type=type.type
     }

     return resourceArcElements2.includes(type)
 }