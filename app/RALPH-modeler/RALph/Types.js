export const label = [
    
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position',

]

export const externalLabel = [
    
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position',
    
]

export const connections = [
    'RALph:ResourceArc',
    'RALph:negatedAssignment',

    'RALph:solidLine',
    'RALph:solidLineWithCircle',
    'RALph:dashedLine',
    'RALph:dashedLineWithCircle',

    'RALph:simpleArrow',
    'RALph:doubleArrow'
]

export const directEdit = [
    //'RALph:Person',
    //'RALph:RoleRALph',
    //'RALph:Personcap',
    //'RALph:Orgunit',
    //'RALph:Position',

]

export const resourceArcElements = [
   
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position'
    
]

export const solidLineElements =[//solo linea solida
    'RALph:History-Same',
    'RALph:History-Any',
    'RALph:DelegateTo',
    'RALph:History-Any-Red',
    'RALph:History-Any-Green',
    'RALph:History-Same-Green',
    'RALph:History-Same-Red'
]

export const HistoryConnectorSameOrPreviousInstanceElements =[//linea solida con punto
    'RALph:History-Same',
    'RALph:History-Any',
    'RALph:History-Any-Red',
    'RALph:History-Any-Green',
    'RALph:History-Same-Green',
    'RALph:History-Same-Red'
]

export const HistoryConnectorPreviousInstanceElements =[//linea con rayas con punto
    'RALph:History-Same',
    'RALph:History-Any',
    'RALph:History-Any-Red',
    'RALph:History-Any-Green',
    'RALph:History-Same-Green',
    'RALph:History-Same-Red'
]


export const custom = [
    
    'RALph:ResourceArc',
    'RALph:Person',
    'RALph:RoleRALph',
    'RALph:Personcap',
    'RALph:Orgunit',
    'RALph:Position',
    'RALph:DelegateTo',
    'RALph:History-Same',
    'RALph:History-Any',
    'RALph:HistoryConnectorActivityInstance',
    'RALph:solidLineWithCircle',
    'RALph:dashedLine',
    'RALph:simpleArrow',
    'RALph:reportsTo',
    'RALph:doubleArrow',
    'RALph:dataField',
    'RALph:History-Any-Red',
    'RALph:History-Any-Green',
    'RALph:History-Same-Green',
    'RALph:History-Same-Red'
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
