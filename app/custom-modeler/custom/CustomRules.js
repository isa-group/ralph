import {
  reduce
} from 'min-dash';

import inherits from 'inherits';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import customModeler from'./CustomModeling';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import {isAny} from "bpmn-js/lib/features/modeling/util/ModelingUtil";
import {isCustomResourceArcElement, isCustomShape,isCustomResourceArc2Element,isHistoryConnectorActivityInstance,isHistoryConnectorSameOrPreviousInstance,isHistoryConnectorPreviousInstanceElements} from "./Types";
import {isLabel} from "bpmn-js/lib/util/LabelUtil";

var HIGH_PRIORITY = 1500;

function isCustom(element) {
  return element && /^custom:/.test(element.type);
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
  return element && (is(element,'custom:Person') || is(element,'custom:RoleRALph') || is(element,'custom:Personcap') || is(element,'custom:Orgunit') || is(element,'custom:Position'))
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
    if(connection === 'custom:ConsequenceFlow') {
      if(isDefaultValid(source) && isDefaultValid(target))
        return { type: connection }
      else
        return false
    }
    else
      return; // utilizza canConnect standard
  }
  else if(is(source, 'custom:TimeSlot')) {
    if(isDefaultValid(target)) {
      if(connection === 'custom:ConsequenceFlow' || connection === 'custom:TimeDistandEndArc')
        return { type: connection }
      else
        return false
    }
    else
      return false
  } else if(is(source, 'custom:nyanCat')) {
    if(isDefaultValid(target)) {
      if(connection === 'custom:ConsequenceFlow' || connection === 'custom:TimeDistandEndArc')
        return { type: connection }
      else
        return false
    }
    else
      return false
  }else if(is(source, 'custom:Person')) {
    if(isDefaultValid(target)) {
      if(connection === 'custom:ConsequenceFlow' || connection === 'custom:TimeDistandEndArc')
        return { type: connection }
      else
        return false
    }
    else
      return false
      
  }
   /*else if(is(target, 'custom:Person')) {
        if(isCustom(source)) {
          if(connection === 'custom:solidLine') // 'custom:ConsequenceFlow' }
            return { type: connection }
        }
        else
          return false
    }*/
    else if(is(source, 'custom:Person')) {
        if(isCustom(target)) {
            if(connection === 'custom:ConsequenceFlow')
              return { type: connection }
        }
        else
          return false    
  /*}else if(is(target, 'custom:Position')) {
    if(isDefaultValid(source)) {
      if(connection === 'custom:TimeDistandStartArc')
        return { type: connection }
      else
        return { type: 'custom:ResourceArc2'}
    }
    else
      return false
  }else if(is(target, 'custom:Orgunit')) {
    if(isDefaultValid(source)) {
      if(connection === 'custom:TimeDistandStartArc')
        return { type: connection }
      else
        return { type: 'custom:ResourceArc'}
    }
    else
      return false*/
   /*} else if(( isDefaultValid(source) && isCustomShape(target) && isCustomResourceArcElement(source)) || (isDefaultValid(target) && isCustomShape(source) &&  isCustomResourceArcElement(target))){
      return { type: 'custom:ResourceArc' }
   } else if((isDefaultValid(source) && isCustomShape(target) && isCustomResourceArc2Element(source)) || (isDefaultValid(target) && isCustomShape(source) && isCustomResourceArc2Element(target))){
      return { type: 'custom:ResourceArc2' }*/
  }else
    return;
}



function canConnect2(source, target, connection) {
  //console.log(target);
  //console.log(source);

  var sourceOutgoingConnections=source.outgoing;
  console.log(sourceOutgoingConnections);
 
  let cond=true;
  //it checks if the source of a connection has already been connected to that target
  //if it is already connected, cond will be false and it will not be possible to 
  //connect the other elements.
  if(target!==null){
    
    var targetIncomingConnections=target.incoming;
    console.log(targetIncomingConnections);

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

  if(connection === 'custom:negatedAssignment' && cond === true){
    if(isValidForResourceEntities(source) && is(target, 'bpmn:Task')){
      return { type: connection }
    }
  }

  if(connection === 'custom:ResourceArc' && cond === true){//if the connection is resourceArc, if source and target have not been connected previously
    //check if the target is one of the possible targets of resourceArc (Orgunit,role,task...etc)
    if( ( is(target, 'custom:Orgunit') && is(source,'custom:RoleRALph')) || is(target, 'bpmn:Task') || is(target, 'bpmn:Event') || is(target,'bpmn:DataObjectReference') || is(target,'bpmn:ExclusiveGateway') || is(target,'bpmn:EndEvent') || is(target,'bpmn:DataStoreReference')){
    return { type: connection }
    }
  }


  if(connection === 'custom:solidLine' && cond === true){
    if(isValidForHistoryConnectors(target) === true){//check if the target is in the list of valid targets for history connectors.
      return { type: connection }
    }
  }

  if(connection === 'custom:solidLineWithCircle' && cond === true) {
    if(isValidForHistoryConnectors(target)){
      return { type: connection }
    }
  }

  if(connection === 'custom:dashedLine' && cond === true){
    if(isValidForHistoryConnectors(target)){
      return { type: connection }
    }
  }

  if(connection === 'custom:dashedLineWithCircle' && cond === true){
    if(isValidForHistoryConnectors(target)){
      return { type: connection }
    }
  }

  else if(connection === 'custom:TimeDistanceArcStart') {
    if(isDefaultValid(source) && is(target, 'custom:TimeSlot'))
      return { type: connection }
    else
      return false
  }
  else if(connection === 'custom:TimeDistanceArcEnd') {
    if(isDefaultValid(target) && is(source, 'custom:TimeSlot'))
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
      if(type === 'custom:ConsequenceTimedFlow')//aqui parece definir la conexion compleja
        return {type1: 'custom:ResourceArc', type2:'custom:ConsequenceFlow'}
      else if(type === 'custom:TimeDistance')
        return {type1: 'custom:TimeDistanceArcStart', type2:'custom:TimeDistanceArcEnd'}
    }
  }

  function canConnectMultipleCustomElement(source, target) {
      if( is(source,'custom:Position') && is(target,'bpmn:Task') ) { 
        return {type3: 'custom:solidLine' , type4: 'custom:simpleArrow' }
      }else if( is(source,'bpmn:Task') && is(target,'custom:Position')  ){
        return {type5: 'custom:solidLine' , type6:'custom:doubleArrow'} //'custom:reportsTo' }
      }else if( is(source,'bpmn:dataRefenceObject') && is(target,'custom:Person')  ){
        return {type5: 'custom:solidLine' , type6:'custom:doubleArrow'}
     }
  }
  function canReconnect(source, target, connection) {
    if(!isCustom(connection) && !isCustom(source) && !isCustom(target))
      return;
    else {
      if(connection.type === 'custom:ConsequenceFlow') {
        if(!isCustom(source) && !isCustom(target))
          return { type: connection.type }
        else if(is(source, 'custom:TimeSlot') && !isCustom(target))
          return { type: connection.type }
        else
          return false
      }
      /*else if(connection.type === 'custom:ResourceArc') {
        if((!isCustom(source) && isCustomShape(target)) || (isCustomShape(source) && !isCustom(target)))
          return { type: connection.type }
        else
          return;
      }else if(connection.type === 'custom:ResourceArc2') {//en duda
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
    var source = context.source,
        target = context.target,
        type = context.type;
    //if(source === "custom:Position" && target === "bpmn:Task")
    if(type === 'custom:Delegate' || type==='custom:Report' || type==='custom:negatedAssignment2')
      return canConnectMultipleCustomElement(source,target)

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