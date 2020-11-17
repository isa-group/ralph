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
    'custom:Position',
    'custom:ResourceArc',
    'custom:ResourceArc2'
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
    'custom:ResourceArc',
    'custom:ResourceArc2'
    //'custom:Personcap'
    
    
]

export const connections = [
    'custom:ResourceArc',
    'custom:ResourceArc2',
    
    'custom:ConsequenceFlow',
    'custom:TimeDistanceArcStart',
    'custom:TimeDistanceArcEnd',

    'custom:negatedAssignment',
    'custom:solidLine',
    'custom:solidLineWithCircle',
    'custom:dashedLine',
    'custom:dashedLineWithCircle',
    'custom:simpleArrow',
    'custom:doubleArrow'
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
    'custom:Position',
    'custom:ResourceArc',
    'custom:ResourceArc2'
]

export const resourceArcElements = [
    /*'custom:Clock',
    'custom:Resource',
    'custom:ResourceAbsence',
    'custom:Role',
    'custom:RoleAbsence',
    'custom:Group',
    'custom:GroupAbsence',
    'custom:TimeSlot',
    'custom:nyanCat',*/
    'custom:Person',
    'custom:RoleRALph',
    'custom:Personcap',
    'custom:Orgunit',
    'custom:Position'
    
]

export const solidLineElements =[//solo linea solida
    'custom:History-Same',
    'custom:History-Any',

]

export const HistoryConnectorSameOrPreviousInstanceElements =[//linea solida con punto
    'custom:History-Same',
    'custom:History-Any'
]

export const HistoryConnectorPreviousInstanceElements =[//linea con rayas con punto
    'custom:History-Same',
    'custom:History-Any',
]


export const resourceArcElements2 = [

]

export const custom = [
    /*'custom:Clock',
    'custom:Resource',
    'custom:ResourceAbsence',
    'custom:Role',
    'custom:RoleAbsence',
    'custom:Group',
    'custom:GroupAbsence',
    'custom:TimeSlot',*/
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
    'custom:Position',
    'custom:delegateTo',
    'custom:reportsTo',
    'custom:simpleArrow',
    'custom:doubleArrow',
    'custom:History',
    'custom:History-Any',
    'custom:HistoryConnectorActivityInstance',
    'custom:solidLineWithCircle',
    'custom:dashedLine',
    //añadir conexiones aqui también
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

    if (typeof type === 'object') {
        type = type.type
    }
    /*if (type.type!="custom:Position"){
        type=type.type
    }*/

    return resourceArcElements.includes(type)
}


export function isCustomResourceArc2Element(type) {

     if (typeof type === 'object') {
        type = type.type
     }

     return resourceArcElements2.includes(type)
 }

 export function isHistoryConnectorActivityInstance(type) {

    if (typeof type === 'object') {
       type = type.type
    }

    return solidLineElements.includes(type)
}


export function isHistoryConnectorSameOrPreviousInstance(type) {

    if (typeof type === 'object') {
       type = type.type
    }

    return HistoryConnectorSameOrPreviousInstanceElements.includes(type)
}



export function isHistoryConnectorPreviousInstanceElements(type) {

    if (typeof type === 'object') {
       type = type.type
    }

    return HistoryConnectorPreviousInstanceElements.includes(type)
}
