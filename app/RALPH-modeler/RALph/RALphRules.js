import {
  reduce
} from 'min-dash';

import inherits from 'inherits';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import customModeler from'./RALphModeling';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import {isAny} from "bpmn-js/lib/features/modeling/util/ModelingUtil";
import {isCustomResourceArcElement, isCustomShape,isCustomResourceArc2Element,isHistoryConnectorActivityInstance,isHistoryConnectorSameOrPreviousInstance,isHistoryConnectorPreviousInstanceElements} from "./Types";
import {isLabel} from "bpmn-js/lib/util/LabelUtil";

var HIGH_PRIORITY = 1500;

function isCustom(element) {
  return element && /^RALph:/.test(element.type);
}

function isDefaultValid(element) {
  return element && (is(element, 'bpmn:Task') || is(element, 'bpmn:Event') || is(element,'bpmn:DataObjectReference') || is(element,'bpmn:ExclusiveGateway') || is(element,'bpmn:EndEvent') || is(element,'bpmn:DataStoreReference') )
}

function isDefaultValid2(element) {
  return element &&  (is(element, 'bpmn:Event'))
}

function isValidForHistoryConnectors(element){
  var cond=false;

  if(is(element, 'bpmn:Task'))
    cond=true;

  return cond;
}

function isValidForResourceEntities(element){
  return element && (is(element,'RALph:Person') || is(element,'RALph:RoleRALph') || is(element,'RALph:Personcap') || is(element,'RALph:Orgunit') || is(element,'RALph:Position'))
}

/**
 * Specific rules for custom elements
 */
export default function CustomRules(eventBus) {
  RuleProvider.call(this, eventBus);

}

inherits(CustomRules, RuleProvider);

CustomRules.$inject = [ 'eventBus',
                        'elementRegistry' ];

function canConnect(source, target, connection) {

  // only judge about custom elements
  if (!isCustom(source) && !isCustom(target)) {
    if(connection === 'RALph:ConsequenceFlow') {
      if(isDefaultValid(source) && isDefaultValid(target))
        return { type: connection }
      else
        return false
    }
    else
      return; // utilizza canConnect standard
  }
  else if(is(source, 'RALph:TimeSlot')) {
    if(isDefaultValid(target)) {
      if(connection === 'RALph:ConsequenceFlow' || connection === 'RALph:TimeDistandEndArc')
        return { type: connection }
      else
        return false
    }
    else
      return false
  } else if(is(source, 'RALph:nyanCat')) {
    if(isDefaultValid(target)) {
      if(connection === 'RALph:ConsequenceFlow' || connection === 'RALph:TimeDistandEndArc')
        return { type: connection }
      else
        return false
    }
    else
      return false
  }else if(is(source, 'RALph:Person')) {
    if(isDefaultValid(target)) {
      if(connection === 'RALph:ConsequenceFlow' || connection === 'RALph:TimeDistandEndArc')
        return { type: connection }
      else
        return false
    }
    else
      return false
      
  }
   /*else if(is(target, 'RALph:Person')) {
        if(isCustom(source)) {
          if(connection === 'RALph:solidLine') // 'RALph:ConsequenceFlow' }
            return { type: connection }
        }
        else
          return false
    }*/
    else if(is(source, 'RALph:Person')) {
        if(isCustom(target)) {
            if(connection === 'RALph:ConsequenceFlow')
              return { type: connection }
        }
        else
          return false    
  /*}else if(is(target, 'RALph:Position')) {
    if(isDefaultValid(source)) {
      if(connection === 'RALph:TimeDistandStartArc')
        return { type: connection }
      else
        return { type: 'RALph:ResourceArc2'}
    }
    else
      return false
  }else if(is(target, 'RALph:Orgunit')) {
    if(isDefaultValid(source)) {
      if(connection === 'RALph:TimeDistandStartArc')
        return { type: connection }
      else
        return { type: 'RALph:ResourceArc'}
    }
    else
      return false*/
   /*} else if(( isDefaultValid(source) && isCustomShape(target) && isCustomResourceArcElement(source)) || (isDefaultValid(target) && isCustomShape(source) &&  isCustomResourceArcElement(target))){
      return { type: 'RALph:ResourceArc' }
   } else if((isDefaultValid(source) && isCustomShape(target) && isCustomResourceArc2Element(source)) || (isDefaultValid(target) && isCustomShape(source) && isCustomResourceArc2Element(target))){
      return { type: 'RALph:ResourceArc2' }*/
  }else
    return;
}



function canConnect2(source, target, connection) {
  //console.log(target);
  //console.log(source);

  var sourceOutgoingConnections=source.outgoing;
 
  let cond=true;
  //it checks if the source of a connection has already been connected to that target
  //if it is already connected, cond will be false and it will not be possible to 
  //connect the other elements.
  if(target!==null){
    
    var targetIncomingConnections=target.incoming;

    for(let i of sourceOutgoingConnections){
      if(targetIncomingConnections.includes(i)){
        cond=false;
      }
    }

  }

  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
    return null;
  }

  if(connection ===  'bpmn:DataOutputAssociation'){
    if( is(target, 'bpmn:DataObjectReference') && is(source,'bpmn:Task') ){
        return { type: connection}
    }
  }

  if(connection === 'RALph:negatedAssignment' && cond === true){
    if(isValidForResourceEntities(source) && is(target, 'bpmn:Task')){
      return { type: connection }
    }
  }

  if(connection === 'RALph:ResourceArc' && cond === true){//if the connection is resourceArc, if source and target have not been connected previously
    //check if the target is one of the possible targets of resourceArc (Orgunit,role,task...etc)
    if( ( is(target, 'RALph:Orgunit') && is(source,'RALph:RoleRALph')) || is(target, 'bpmn:Task') || is(target, 'bpmn:Event') || is(target,'bpmn:DataObjectReference') || is(target,'bpmn:ExclusiveGateway') || is(target,'bpmn:EndEvent') || is(target,'bpmn:DataStoreReference') || is(target,'RALph:Complex-Assignment-AND') || is(target,'RALph:Complex-Assignment-OR') ){
    return { type: connection }
    }
  }


  if(connection === 'RALph:solidLine' && cond === true){
    if(isValidForHistoryConnectors(target) && sourceOutgoingConnections.length<2){//check if the target is in the list of valid targets for history connectors.
      return { type: connection }
    }
  }

  

  if(connection === 'RALph:solidLineWithCircle' && cond === true) {
    if(isValidForHistoryConnectors(target) && sourceOutgoingConnections.length<2){
      return { type: connection }
    }
  }

  if(connection === 'RALph:dashedLine' && cond === true){
    if(isValidForHistoryConnectors(target) && sourceOutgoingConnections.length<2){
      return { type: connection }
    }
  }

  if(connection === 'RALph:dashedLineWithCircle' && cond === true){
    if(isValidForHistoryConnectors(target) && sourceOutgoingConnections.length<2){
      return { type: connection }
    }
  }

  else if(connection === 'RALph:TimeDistanceArcStart') {
    if(isDefaultValid(source) && is(target, 'RALph:TimeSlot'))
      return { type: connection }
    else
      return false
  }
  else if(connection === 'RALph:TimeDistanceArcEnd') {
    if(isDefaultValid(target) && is(source, 'RALph:TimeSlot'))
      return { type: connection }
    else
      return false
  }
  else {
    if (!isCustom(source) && !isCustom(target))
      return;
  }
}

CustomRules.prototype.init = function() {

  /**
   * Can shape be created on target container?
   */
  function canCreate(shape, target) {

    // only judge about custom elements
    if (!isCustom(shape)) {
      return;
    }

    // allow creation on processes
    return is(target, 'bpmn:Process') || is(target, 'bpmn:Participant') || is(target, 'bpmn:Collaboration');
  }

  /**
   * Can source and target be connected?
   */


  function canConnectMultiple(source, target, type) {
    if (is(source, 'bpmn:Task') && is(target, 'bpmn:Task')) {
      if(type === 'RALph:ConsequenceTimedFlow')//aqui parece definir la conexion compleja
        return {type1: 'RALph:ResourceArc', type2:'RALph:ConsequenceFlow'}
      else if(type === 'RALph:TimeDistance')
        return {type1: 'RALph:TimeDistanceArcStart', type2:'RALph:TimeDistanceArcEnd'}
    }
  }

  function canConnectMultipleCustomElement(source, target) {
      if( is(source,'RALph:Position') && is(target,'bpmn:Task') ) { 
        return {type3: 'RALph:solidLine' , type4: 'RALph:simpleArrow' }
      /*}else if( is(source,'bpmn:Task') && is(target,'RALph:Position')  ){
        return {type5: 'RALph:solidLine' , type6:'RALph:doubleArrow'} //'RALph:reportsTo' }
      */}else if( is(source,'bpmn:DataObjectReference') && is(target,'RALph:Person')  ){
        return {type7:'RALph:ResourceArc', type8:'RALph:simpleArrow'}
      }
  }

  function connectHierarchyConnectors(source,target,type) {
    console.log(source);
    
    if(is(source,'bpmn:Task') && type === "RALph:ReportsDirectlyAssignment"){

      return {type9:'RALph:ResourceArc'}

    }else if(is(source,'bpmn:Task') && type === "RALph:ReportsTransitivelyAssignment"){
     
      return {type10:'RALph:ResourceArc'}

    }
  }

  function canReconnect(source, target, connection) {
    if(!isCustom(connection) && !isCustom(source) && !isCustom(target))
      return;
    else {
      if(connection.type === 'RALph:ConsequenceFlow') {
        if(!isCustom(source) && !isCustom(target))
          return { type: connection.type }
        else if(is(source, 'RALph:TimeSlot') && !isCustom(target))
          return { type: connection.type }
        else
          return false
      }
      /*else if(connection.type === 'RALph:ResourceArc') {
        if((!isCustom(source) && isCustomShape(target)) || (isCustomShape(source) && !isCustom(target)))
          return { type: connection.type }
        else
          return;
      }else if(connection.type === 'RALph:ResourceArc2') {//en duda
        if((!isCustom(source) && isCustomShape(target)) || (isCustomShape(source) && !isCustom(target)))
          return { type: connection.type }
        else
          return;
      }*/
      // add time distance
      else {
        return canConnect(source, target, connection.type)
      }
    }

  }

  this.addRule('elements.move', HIGH_PRIORITY, function(context) {

    var target = context.target,
        shapes = context.shapes;

    var type;

    // do not allow mixed movements of custom / BPMN shapes
    // if any shape cannot be moved, the group cannot be moved, too
    var allowed = reduce(shapes, function(result, s) {
      if (type === undefined) {
        type = isCustom(s);
      }

      if (type !== isCustom(s) || result === false) {
        return false;
      }

      return canCreate(s, target);
    }, undefined);

    // reject, if we have at least one
    // custom element that cannot be moved
    return allowed;
  });

  this.addRule('shape.create', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shape = context.shape;

    return canCreate(shape, target);
  });

  this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
    var shape = context.shape;

    if (isCustom(shape)) {
      // cannot resize custom elements
      return true;
    }
  });

  this.addRule('connection.create', HIGH_PRIORITY, function(context) {
    console.log(context);
    var source = context.source,
        target = context.target,
        type = context.type;

    if(type === 'RALph:Delegate' || type==='RALph:Report' || type==='RALph:dataFieldConnection'){
    
      return canConnectMultipleCustomElement(source,target)

    }else if(type==='RALph:ReportsDirectlyAssignment' || type==="RALph:ReportsTransitivelyAssignment"){
      var cond=true;
      var sourceOutgoingConnections=source.outgoing;
      
      for(let connection of sourceOutgoingConnections){
        if(connection.businessObject.target.includes("reports")){
          cond=false;
        }
      }

      if(cond===true){
        return connectHierarchyConnectors(source,target,type);
      }
    }
    
    return canConnect2(source, target, type);
  });

  this.addRule('connection.reconnectStart', HIGH_PRIORITY*2, function(context) {
    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;

    return canConnect2(source, target, connection.type);
  });

  this.addRule('connection.reconnectEnd', HIGH_PRIORITY*2, function(context) {
    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    return canConnect2(source, target, connection.type);
  });


};

function nonExistingOrLabel(element) {
  return !element || isLabel(element);
}

CustomRules.prototype.canConnect = function (source, target, connection) {

  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
    return null;
  }
  return canConnect2(source, target, connection.type)

}