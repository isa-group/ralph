import {
  reduce
} from 'min-dash';

import inherits from 'inherits';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import {isAny} from "bpmn-js/lib/features/modeling/util/ModelingUtil";
import {isCustomResourceArcElement, isCustomShape,isCustomResourceArc2Element,isHistoryConnectorActivityInstance,isHistoryConnectorSameOrPreviousInstance,isHistoryConnectorPreviousInstanceElements} from "./Types";
import {isLabel} from "bpmn-js/lib/util/LabelUtil";

var HIGH_PRIORITY = 1500;
let historyConnectors=[];
let resourceEntities=[];

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

CustomRules.$inject = [ 'eventBus' ];

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
  else if(is(target, 'custom:TimeSlot')) {
    if(isDefaultValid(source)) {
      if(connection === 'custom:TimeDistandStartArc')
        return { type: connection }
      else
        return { type: 'custom:ResourceArc'}
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
function giveHistory(){
    return historyConnectors;
}

function updateHistoryConnectors(connection){
  historyConnectors.push(connection);
}


function canConnect2(source, target, connection,historyConnectors) {

  var source2=getBusinessObject(source);//source.businessObject;
  var target2=getBusinessObject(target);

  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
    return null;
  }
  /*if(connection === 'custom:ConsequenceFlow') {
    if(isDefaultValid(source) && isDefaultValid(target))
      return { type: connection }
    else if(is(source, 'custom:TimeSlot') && isDefaultValid(target))
      return { type: connection }
    else
      return false
  }*/
  let cond=true;


  if(target.id !== undefined && historyConnectors.length>1){

    var sourceTarget=source2.id+target2.id;
    
      for (var i=0; i < historyConnectors.length; i++) {

        var histConnect=historyConnectors[i];
        var similarity=histConnect.localeCompare(sourceTarget);

          if( similarity === 0 ){
              cond=false;
          }
      }
  }
  
  if(connection ===  'bpmn:DataOutputAssociation'){
    if( is(target, 'bpmn:DataObjectReference') && is(source,'bpmn:Task') ){
        return { type: connection}
    }
  }

  if(connection === 'custom:negatedAssignment'){
    if(isValidForResourceEntities(source) && is(target, 'bpmn:Task')){
      return { type: connection }
    }
  }

  if(connection === 'custom:ResourceArc') {
    if(isDefaultValid(target) || isDefaultValid(source) || ( is(target, 'custom:Orgunit') && is(source,'custom:RoleRALph') ) )
    return { type: connection }
  }

  if(connection === 'custom:ResourceArc2') {
    if(isDefaultValid(target) || isDefaultValid(source))
      return { type: connection }
  }

  if(connection === 'custom:solidLine' && cond === true){
    if(isValidForHistoryConnectors(target) === true)
      historyConnectors.push(source2.id+target2.id);
      return { type: connection }
  }

  //historyConnectors.forEach(function(element) {if (element === [source,target]){cond=false } } ) === true)
  if(connection === 'custom:solidLineWithCircle' && cond === true) {
    if(isValidForHistoryConnectors(target))
      historyConnectors.push(source2.id+target2.id);
      return { type: connection }
  }

  if(connection === 'custom:dashedLine' && cond === true){
    if(isValidForHistoryConnectors(target))
      historyConnectors.push(source2.id+target2.id);
      return { type: connection }
  }

  if(connection === 'custom:dashedLineWithCircle' && cond === true){
    if(isValidForHistoryConnectors(target))
      historyConnectors.push(source2.id+target2.id);
      return { type: connection }
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
      
    /*else if( (isDefaultValid(source) && isCustomResourceArcElement(target)) || (isDefaultValid(target) && isCustomResourceArcElement(source)) ) {
        return { type: 'custom:ResourceArc'}
    }else if((isDefaultValid(source) && isCustomResourceArc2Element(target)) || (isDefaultValid(target) && isCustomResourceArc2Element(source))) 
        return { type: 'custom:ResourceArc2'}
    else*/
      return
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
        return {type3: 'custom:solidLine' , type4: 'custom:ConsequenceFlow' }
      }else if( is(source,'bpmn:Task') && is(target,'custom:Position')  ){
        return {type3: 'custom:solidLine' , type4:'custom:reportsTo'} //'custom:reportsTo' }
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
      else if(connection.type === 'custom:ResourceArc') {
        if((!isCustom(source) && isCustomShape(target)) || (isCustomShape(source) && !isCustom(target)))
          return { type: connection.type }
        else
          return;
      }else if(connection.type === 'custom:ResourceArc2') {//en duda
        if((!isCustom(source) && isCustomShape(target)) || (isCustomShape(source) && !isCustom(target)))
          return { type: connection.type }
        else
          return;
      }
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

    var hist=giveHistory()
    //if(source === "custom:Position" && target === "bpmn:Task")
    if(type === 'custom:Delegate' || type==='custom:Report' || type==='custom:negatedAssignment2')
      return canConnectMultipleCustomElement(source,target)

    return canConnect2(source, target, type,hist);
  });

  this.addRule('connection.reconnectStart', HIGH_PRIORITY*2, function(context) {
    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;
    var hist=giveHistory()

    return canConnect2(source, target, connection.type,hist);
  });

  this.addRule('connection.reconnectEnd', HIGH_PRIORITY*2, function(context) {
    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    var hist=giveHistory()

    return canConnect2(source, target, connection.type,hist);
  });

};

function nonExistingOrLabel(element) {
  return !element || isLabel(element);
}

CustomRules.prototype.canConnect = function (source, target, connection) {
  var hist=giveHistory()

  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
    return null;
  }
  return canConnect2(source, target, connection.type,hist)

}