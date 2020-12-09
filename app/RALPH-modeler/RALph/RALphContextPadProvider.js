import inherits from 'inherits';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import {is} from "bpmn-js/lib/util/ModelUtil";

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  assign,
  bind
} from 'min-dash';
import {isLabel} from "./utils/LabelUtil";

import {resourceArcElements,resourceArcElements2,solidLineElements,HistoryConnectorSameOrPreviousInstanceElements,HistoryConnectorPreviousInstanceElements} from "./Types";


export default function RALphContextPadProvider(config, injector, elementFactory, connect, create, translate) {

    injector.invoke(ContextPadProvider, this);

    var cached = bind(this.getContextPadEntries, this);

    let autoPlace = config.autoPlace
    if (autoPlace !== false) {
        autoPlace = injector.get('autoPlace', false);
    }

    function appendAction(type, className, title, options) {
        if (typeof title !== 'string') {
            options = title;
            title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
        }

        function appendStart(event, element) {
            var shape = elementFactory.createShape(assign({ type: type }, options));
            create.start(event, shape, {
                source: element
            });
        }

        function append(event, element) {
            var shape = elementFactory.createShape(assign({ type: type }, options));

            autoPlace.append(element, shape);
        }


        return {
            group: 'model',
            className: className,
            title: title,
            action: {
                dragstart: appendStart,
                click: autoPlace ? append : appendStart
            }
        };
    }

    function appendConnectAction(type, className, title) {
        if (typeof title !== 'string') {
            title = translate('Append {type}', { type: type.replace(/^RALph:/, '') });
        }

        function connectStart(event, element, autoActivate) {
            connect.customStart(event, element, type, elementFactory, autoActivate);
        }


        return {
            group: 'connect',
            className: className,
            title: title,
            action: {
                dragstart: connectStart,
                click: connectStart
            }
        };
    }

    this.getContextPadEntries = function(element) {
    var actions = cached(element);
    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

    function startConnect2(event, element, autoActivate) {
        connect.start(event, element, autoActivate);
      }

    function startConnectConsequence(event, element, autoActivate) {
      connect.customStart(event, element, 'RALph:ConsequenceFlow', autoActivate);
    }

    function startConnectConsequenceTimed(event, element, autoActivate) {
      connect.customStart2(event, element, 'RALph:ConsequenceTimedFlow', elementFactory, autoActivate);
    }

    function startConnectTimeDistance(event, element, autoActivate) {
        connect.customStart2(event, element, 'RALph:ConsequenceTimedFlow', elementFactory, autoActivate);
    }


    if (isAny(businessObject, resourceArcElements) && element.type !== 'label') {
        assign(actions, {
            'connect1': appendConnectAction(
                'RALph:ResourceArc',
                'icon-RALph-solidLineDef',
                'Connect using simple resource assignment'
            ),
            
            'connect2': appendConnectAction(
                    'RALph:negatedAssignment',
                    'icon-RALph-negatedDef',//'icon-RALph-Negated',
                    'Connect using negated connection'
                )
        });
    }

    if (is(businessObject, 'RALph:Position') && element.type !== 'label') {
        assign(actions, {
            'connectPos': appendConnectAction(
                'RALph:Delegate',
                'icon-RALph-Delegate',
                'Connect using delegate'
            ),
        });
    }

    
    if(isAny(businessObject,solidLineElements) && element.type !== 'label') {
        assign(actions, {
            'connect1': appendConnectAction(
                'RALph:solidLine',
                'icon-RALph-solidLineDef',//'icon-RALph-SolidLine',
                'Connect using a solid line'
            ),'connect2': appendConnectAction(
                'RALph:solidLineWithCircle',
                'icon-RALph-solidLineWithCircleDef',
                'Connect using a solid line with a circle'
            ),'connect3': appendConnectAction(
                'RALph:dashedLine',
                'icon-RALph-dashedLineDef',//'icon-RALph-dashedLine2',
                'Connect using a dashed line'
            ),'connect4': appendConnectAction(
                'RALph:dashedLineWithCircle',
                'icon-RALph-dashedLineWithCircle',//'bpmn-icon-connection-multi',
                'Connect using a dashed line with circle'
            )
        });
    }

    if(is(businessObject, 'bpmn:Task') && element.type !== 'label') {
        assign(actions, {
            'connect4': appendConnectAction(
                'RALph:Report',
                'icon-RALph-Report',//'bpmn-icon-connection-multi',
                'Connect using report connection'
            ),
            'connect5': appendConnectAction(
                'bpmn:DataOutputAssociation',
                'bpmn-icon-connection-multi',//'bpmn-icon-connection-multi',
                'Connect using data output association'
            ),
            'connect6':appendConnectAction(
                'RALph:ReportsDirectlyAssignment',
                'icon-RALph-Report',//'bpmn-icon-connection-multi',
                'Connect using report directly connection'
            )
            
        });
    }

    if(is(businessObject, 'bpmn:DataObjectReference') && element.type !== 'label') {
        assign(actions, {
            'connect4': appendConnectAction(
                'RALph:dataFieldConnection',
                'bpmn-icon-connection-multi',
                'Connect using data field connection')
        });
    }

    return actions;
  };
}

inherits(RALphContextPadProvider, ContextPadProvider);

RALphContextPadProvider.$inject = [
    'config',
    'injector',
    'elementFactory',
    'connect',
    'create',
    'translate'
];