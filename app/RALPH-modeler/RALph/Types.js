export const label = [
    'RALph:Resource',
    'RALph:ResourceAbsence',
    'RALph:Role',
    'RALph:RoleAbsence',
    'RALph:Group',
    'RALph:GroupAbsence',
    'RALph:Clock',
    'RALph:TimeSlot',
    'RALph:nyanCat',
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position',
    'RALph:ResourceArc',
    'RALph:ResourceArc2'
]

export const externalLabel = [
    'RALph:Resource',
    'RALph:ResourceAbsence',
    'RALph:Role',
    'RALph:RoleAbsence',
    'RALph:Group',
    'RALph:GroupAbsence',
    'RALph:Clock',
    'RALph:nyanCat',
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:ResourceArc',
    'RALph:ResourceArc2',
    'RALph:Personcap'
    
]

export const connections = [
    'RALph:ResourceArc',
    'RALph:ResourceArc2',
    
    'RALph:ConsequenceFlow',
    'RALph:TimeDistanceArcStart',
    'RALph:TimeDistanceArcEnd',

    'RALph:negatedAssignment',
    'RALph:solidLine',
    'RALph:solidLineWithCircle',
    'RALph:dashedLine',
    'RALph:dashedLineWithCircle',

    'RALph:simpleArrow',
    'RALph:doubleArrow'
]

export const directEdit = [
    // 'RALph:Resource',
    // 'RALph:Role',
    // 'RALph:Group',
    'RALph:Clock',
    'RALph:TimeSlot',
    'RALph:nyanCat',
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position',
    'RALph:ResourceArc',
    'RALph:ResourceArc2'
]

export const resourceArcElements = [
    /*'RALph:Clock',
    'RALph:Resource',
    'RALph:ResourceAbsence',
    'RALph:Role',
    'RALph:RoleAbsence',
    'RALph:Group',
    'RALph:GroupAbsence',
    'RALph:TimeSlot',
    'RALph:nyanCat',*/
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position'
    
]

export const solidLineElements =[//solo linea solida
    'RALph:History-Same',
    'RALph:History-Any',
    'RALph:DelegateTo'
]

export const HistoryConnectorSameOrPreviousInstanceElements =[//linea solida con punto
    'RALph:History-Same',
    'RALph:History-Any'
]

export const HistoryConnectorPreviousInstanceElements =[//linea con rayas con punto
    'RALph:History-Same',
    'RALph:History-Any',
]


export const resourceArcElements2 = [

]

export const custom = [
    /*'RALph:Clock',
    'RALph:Resource',
    'RALph:ResourceAbsence',
    'RALph:Role',
    'RALph:RoleAbsence',
    'RALph:Group',
    'RALph:GroupAbsence',
    'RALph:TimeSlot',*/
    'RALph:ResourceArc',
    'RALph:ResourceArc2',
    'RALph:ConsequenceFlow',
    'RALph:TimeDistanceArcStart',
    'RALph:TimeDistanceArcEnd',
    'RALph:nyanCat',
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position',
    'RALph:DelegateTo',
    'RALph:RedCross',
    'RALph:History',
    'RALph:History-Any',
    'RALph:HistoryConnectorActivityInstance',
    'RALph:solidLineWithCircle',
    'RALph:dashedLine',
    'RALph:simpleArrow',
    'RALph:reportsTo',
    'RALph:doubleArrow',
    'RALph:dataField'
    //añadir conexiones aqui también
]

export function isCustomShape(type) {
    if (typeof type === 'object')
        type = type.type

    return type.includes('RALph:') && !connections.includes(type)
}

export function isCustomConnection(type) {
    if (typeof type === 'object') {
        type = type.type
    }
    return type.includes('RALph:') && connections.includes(type)
}

export function isCustomResourceArcElement(type) {

    if (typeof type === 'object') {
        type = type.type
    }
    /*if (type.type!="RALph:Position"){
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
