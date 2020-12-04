import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import BpmnRenderer from "bpmn-js/lib/draw/BpmnRenderer";

import {componentsToPath, createLine} from 'diagram-js/lib/util/RenderUtil';
import {query as domQuery} from 'min-dom';
import Cat from './SVGs';
import {append as svgAppend, attr as svgAttr, classes as svgClasses, create as svgCreate} from 'tiny-svg';
import {getFillColor, getSemantic, getStrokeColor} from "bpmn-js/lib/draw/BpmnRenderUtil";
import {assign} from "min-dash";
import Ids from 'ids';
import {getLabel} from "./utils/LabelUtil"
import BaseElementFactory from "diagram-js/lib/core/ElementFactory";
import {isCustomConnection, isCustomShape} from "./Types";

// import * as svg from 'tiny-svg'

var RENDERER_IDS = new Ids();

var COLOR_GREEN = '#52B415',
    COLOR_RED = '#cc0000',
    COLOR_YELLOW = '#ffc800',
    BLACK = '#000',
    WHITE="#fff";


/**
 * A renderer that knows how to render custom elements.
 */
export default function CustomRenderer(eventBus, styles, canvas, textRenderer) {

  BaseRenderer.call(this, eventBus, 2000);

  var computeStyle = styles.computeStyle;

  var rendererId = RENDERER_IDS.next();

  var markers = {};


  function drawCrossedLine(points,attrs){
    var line = svgCreate('polyline');
    var result='';//toSVGPoints(points)

    /*if(points[0].y===points[1].y){
    //result +=(parseInt(points[0].x)).toString()+ ',' + (parseInt(points[0].y)-30).toString()+ ','+(parseInt(points[0].x+50)).toString()+ ',' + (parseInt(points[0].y+30)).toString();
    
      result +=(points[0].x + parseInt(points[1].x-points[0].x)/4).toString()+ ',' + (parseInt(points[0].y)+20).toString()+ ','+(points[0].x + parseInt(points[1].x-points[0].x)*3/4).toString()+ ',' + (parseInt(points[0].y)-20).toString();
      svgAttr(line, {points: result });

    }else if(points[0].x===points[1].x){
  
      result +=(points[0].x + 20).toString()+ ',' + (parseInt(points[0].y + parseInt(points[1].y-points[0].y)/4)).toString()+ ','+(points[0].x -20).toString()+ ',' + (points[0].y + parseInt(points[1].y-points[0].y)*3/4).toString();
      svgAttr(line, {points: result });

    }else{*/

      var middlePosition=points.length/2;
      middlePosition=Math.round(middlePosition)

      var middlePointX=(points[middlePosition].x+points[middlePosition-1].x)/2;
      var middlePointY=(points[middlePosition].y+points[middlePosition-1].y)/2;
      result +=(middlePointX-20).toString()+ ',' + (middlePointY+20).toString()+ ','+(middlePointX+20).toString()+ ',' +  parseInt(middlePointY-20).toString();
      //result +=(middlePointX).toString()+ ',' + (middlePointY+5).toString()+ ','+(middlePointX).toString()+ ',' +  parseInt(middlePointY-5).toString();
      svgAttr(line, {points: result });

    //}


    if (attrs) {
      svgAttr(line, attrs);
    }


    return line
  }


  function drawCrossedLine2(points,attrs){

    var line = svgCreate('polyline');
    var result='';
    //result +=(parseInt(points[0].x)).toString()+ ',' + (parseInt(points[0].y)-30).toString()+ ','+(parseInt(points[0].x+50)).toString()+ ',' + (parseInt(points[0].y+30)).toString();
    /*if(points[0].y === points[1].y){
    
      result +=(points[0].x + parseInt(points[1].x-points[0].x)*3/4).toString()+ ',' + (parseInt(points[0].y)+20).toString()+ ','+(points[0].x + parseInt(points[1].x-points[0].x)/4).toString()+ ',' + (parseInt(points[0].y)-20).toString();
      svgAttr(line, {points: result });

    }else if(points[0].x === points[1].x){

      result +=(parseInt(points[0].x)+20).toString()+ ',' + (points[0].y + parseInt(points[1].y-points[0].y)*3/4).toString()+ ','+(parseInt(points[0].x) -20).toString()+ ',' + (points[0].y + parseInt(points[1].y-points[0].y)/4).toString();
      svgAttr(line, {points: result });
  }else{*/
      var middlePosition;

      middlePosition=points.length/2;
      middlePosition=Math.round(middlePosition)

      var middlePointX=(points[middlePosition].x+points[middlePosition-1].x)/2;
      var middlePointY=(points[middlePosition].y+points[middlePosition-1].y)/2;

      //result +=(middlePointX+5).toString()+ ',' + (middlePointY+5).toString()+ ','+(middlePointX-5).toString()+ ',' +  parseInt(middlePointY-5).toString();
      //result +=(middlePointX+5).toString()+ ',' + (middlePointY).toString()+ ','+(middlePointX-5).toString()+ ',' +  parseInt(middlePointY).toString();
      result +=(middlePointX+20).toString()+ ',' + (middlePointY+20).toString()+ ','+(middlePointX-20).toString()+ ',' +  parseInt(middlePointY-20).toString();
      svgAttr(line, {points: result });

  //}
    

    if (attrs) {
      svgAttr(line, attrs);
    }

    return line
  }

  function renderLabel(parentGfx, label, options) {
    options = assign({
      size: {
        width: 100
      }
    }, options);

    var text = textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx,semantic.text, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: element.color
      }
    });
  }

  function renderExternalLabel(parentGfx, element) {
    var box = {
      width: 90,
      height: 10,
      x: element.width / 2 + element.x,
      y: element.height /2 + element.y
    };
    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign(
          {},
          textRenderer.getExternalStyle(),
          {
            fill: element.color
          }
      )
    });
  }

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  function addMarker(id, options) {
    var attrs = assign({
      fill: 'black',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeDasharray: 'none'
    }, options.attrs);

    var ref = options.ref || { x: 0, y: 0 };

    var scale = options.scale || 1;

    if (attrs.strokeDasharray === 'none') {
      attrs.strokeDasharray = [10000, 1];
    }

    var marker = svgCreate('marker');

    svgAttr(options.element, attrs);

    svgAppend(marker, options.element);

    svgAttr(marker, {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

    var defs = domQuery('defs', canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');

      svgAppend(canvas._svg, defs);
    }

    svgAppend(defs, marker);

    markers[id] = marker;
  }

  function colorEscape(str) {
    return str.replace(/[()\s,#]+/g, '_');
  }

  function marker(type, fill, stroke,x,y) {
    var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

    if (!markers[id]) {
      createMarker(id, type, fill, stroke,x,y);
    }

    return 'url(#' + id + ')';
  }

  function createMarker(id, type, fill, stroke,x,y,x2,y2) {

    if (type === 'sequenceflow-end') {
      var sequenceflowEnd = svgCreate('path');
      svgAttr(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 11, y: 10 },
        scale: 1.5,
        attrs: {
          fill: stroke,
          stroke: stroke
        }
      });
    }

    if (type === 'timedistance-start') {
      var sequenceflowEnd = svgCreate('path');
      svgAttr(sequenceflowEnd, { d: 'M -10 -5 L 20 10 L -10 25 L 20 10  Z' });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 5, y: 10 },
        scale: 0.8,
        attrs: {
          fill: '#fff',
          stroke: stroke,
          strokeWidth: 1.5,
          fillOpacity: 0
        }
      });
    }

    if (type === 'timedistance-end') {
      var sequenceflowEnd = svgCreate('path');
      svgAttr(sequenceflowEnd, { d: 'M 35 0 L 0 15 L 35 30 L 0 15  Z' });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 14, y: 15 },
        scale: 0.8,
        attrs: {
          fill: '#fff',
          stroke: stroke,
          strokeWidth: 1.5,
          fillOpacity: 0
        }
      });
    }
    if(type === "doubleArrow"){
      var dobleFlecha=svgCreate('path');
     
      svgAttr(dobleFlecha,{d:'M 0 0 L 3 3 L 0 6 M 3 6 L 6 3 L 3 0'});
  
      addMarker(id, {
        element: dobleFlecha,
        attrs: {
          stroke: stroke
        },
        ref: {x:6,y:3},
        scale: 3
      });

    }

    if (type === 'messageflow-start') {
      var messageflowStart = svgCreate('circle');
      svgAttr(messageflowStart, { cx: 6, cy: 6, r: 3.5 });

      addMarker(id, {
        element: messageflowStart,
        attrs: {
          fill: fill,
          stroke: stroke
        },
        ref: { x: 6, y: 6 }
      });
    }

    if (type === 'history-source-another-start') {
      var messageflowStart = svgCreate('circle');
      svgAttr(messageflowStart, { cx: 6, cy: 6, r: 5.5 });

      addMarker(id, {
        element: messageflowStart,
        attrs: {
          fill:WHITE,
          stroke: stroke
        },
        scale:2.5,
        ref: { x: 7, y: 7 }
      });
    }


    if (type === 'history-source-another-end') {
      var messageflowStart = svgCreate('circle');
      svgAttr(messageflowStart, { cx: 6, cy: 6, r: 3.5 });

      addMarker(id, {
        element: messageflowStart,
        attrs: {
          fill:BLACK,
          stroke: stroke
        },
        ref: { x: 6, y: 6 }
      });
    }

    if (type === 'messageflow-end') {
      var messageflowEnd = svgCreate('path');
      svgAttr(messageflowEnd, { d: 'm 1 5 l 0 -3 l 7 3 l -7 3 z' });

      addMarker(id, {
        element: messageflowEnd,
        attrs: {
          fill: fill,
          stroke: stroke,
          strokeLinecap: 'butt'
        },
        ref: { x: 8.5, y: 5 }
      });
    }


    if (type === 'association-start') {
      var associationStart = svgCreate('path');
      svgAttr(associationStart, { d: 'M 11 5 L 1 10 L 11 15' });

      addMarker(id, {
        element: associationStart,
        attrs: {
          fill: 'none',
          stroke: stroke,
          strokeWidth: 1.5
        },
        ref: { x: 1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'association-end') {
      var associationEnd = svgCreate('path');
      svgAttr(associationEnd, { d: 'M 1 5 L 11 10 L 1 15' });

      addMarker(id, {
        element: associationEnd,
        attrs: {
          fill: 'none',
          stroke: stroke,
          strokeWidth: 1.5
        },
        ref: { x: 12, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-flow-marker') {
      var conditionalflowMarker = svgCreate('path');
      svgAttr(conditionalflowMarker, { d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z' });

      addMarker(id, {
        element: conditionalflowMarker,
        attrs: {
          fill: fill,
          stroke: stroke
        },
        ref: { x: -1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-default-flow-marker') {
      var conditionaldefaultflowMarker = svgCreate('path');
      svgAttr(conditionaldefaultflowMarker, { d: 'M 6 4 L 10 16' });

      addMarker(id, {
        element: conditionaldefaultflowMarker,
        attrs: {
          stroke: stroke
        },
        ref: { x: 0, y: 10 },
        scale: 0.5
      });
    }



    if(type === "negated"){
      var dobleFlecha=svgCreate('path');
      //var dpath='';
      
      var zero=parseInt('0');
      var ten=parseInt('10');
      var x1=parseInt(x)
      var x2=parseInt(x2)
      var y1=parseInt(y1)
      var y2=parseInt(y2)

      var dpath='M '+zero+' '+zero+' L '+ten+' '+ten+' M '+ten+' '+zero+' L '+zero+' '+ ten

      svgAttr(dobleFlecha,{d:dpath,orient:'auto'});
      addMarker(id, {
        element: dobleFlecha,
        attrs: {
          stroke: 'red'
        },
        ref: {x:90 , y:5}, //{ x: 50, y: 5},
        orient:'auto',
        scale: 4.0
      });

    }

    if(type === "negated2"){
      var dobleFlecha=svgCreate('path');
     
      svgAttr(dobleFlecha,{d:'M 10 0 L 0 10',orient:'auto'});
     
      addMarker(id, {
        element: dobleFlecha,
        attrs: {
          stroke: 'red'
        },
        ref: { x: -100, y: 5},
        orient:'auto',
        scale: 0.5
      });
    }
  }

  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }


  function drawDataField(shape){

    var catGfx = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataField
    });

    return  catGfx;
  }

  function drawReportsTo(shape){

    var catGfx = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataReports2
    });

    return  catGfx;
  }

  function drawPosition(shape){

    var pos = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataPositionTest//Cat.dataPositionRALph2
    });

    return pos;
  }

  function drawAND(shape){
    var AND = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataAND
    });

    return AND;
  }

  function drawOR(shape){
    var OR = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataOR
    });

    return OR;
  }

  function drawPerson(shape){
    var person = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.personTest//dataPersonRalph2
    });

    return  person;
  }

  function drawDelegateTo(shape){
    var delegate = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataCanDelegate2
    });

    return delegate;
  }

  function drawRoleRALph(shape){
    var role = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataRoleTest//Cat.dataRoleRalph2
    });

    return role;
  }

  function drawPersoncap(shape){
    var cap = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataCapabilityTest//dataCapabilityRALph2
    });

    return cap;
  }
  function drawHistoryAnyRedConnector(shape){
    var hist = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataHistoryAnyRed
    });

    return hist;

  }

  function drawHistoryAnyGreenConnector(shape){
    var hist = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataHistoryAnyGreen
    });

    return hist;

  }

  function drawHistorySameGreenConnector(shape){
    var hist = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataHistorySameGreen
    });

    return hist;

  }

  function drawHistorySameRedConnector(shape){
    var hist = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataHistorySameRed
    });

    return hist;

  }

  function drawOrgunit(shape){
    var org = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataOrgUnitRALph2
    });

    return org;
  }

  function drawHistoryConnector(shape){
    var org = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataHistorySame
    });

    return org;
  }

  function drawHistoryAnyConnector(shape){
    var org = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataHistoryAny
    });

    return org;
  }


  function drawTimeSlot(width, height, color) {
    var attrs = computeStyle(attrs, {
      stroke: color || '#fff',
      strokeWidth: 2,
      fill: '#fff'
    });

    var polygon = svgCreate('rect');

    svgAttr(polygon, {
      width: width,
      height: height,
      rx: 20,
      ry: 20
    });

    svgAttr(polygon, attrs);

    return polygon
  }


 

  var renderers = this.renderers = {
    
    'RALph:Position':(p,element) =>{
      let pos=drawPosition(element)

      svgAppend(p,pos)
      //renderEmbeddedLabel(p,element,'center-middle')
      return pos;
    },'RALph:Complex-Assignment-OR':(p,element)=>{
      let OR=drawOR(element)

      svgAppend(p,OR)
      //renderEmbeddedLabel(p,element,'center-middle')
      return OR;

    
    },'RALph:Complex-Assignment-AND':(p,element)=>{
      let AND=drawAND(element)

      svgAppend(p,AND)
      //renderEmbeddedLabel(p,element,'center-middle')
      return AND;


    },'RALph:Orgunit':(p,element) =>{
      let org=drawOrgunit(element)

      svgAppend(p,org)
      //renderEmbeddedLabel(p,element,'center-middle')

      return org;

    },'RALph:Personcap':(p,element) =>{
      let cap=drawPersoncap(element)

      svgAppend(p,cap)

      return cap;

    },'RALph:Person':(p,element)=>{
        let person=drawPerson(element)
        
        svgAppend(p,person)
        return person;

    },'RALph:RoleRALph':(p,element)=>{
        let role=drawRoleRALph(element)

        svgAppend(p,role)
        return role;

    },'RALph:History-Same':(p,element)=>{
      let connector=drawHistoryConnector(element)

      
      svgAppend(p,connector)
      return connector;

    },'RALph:History-Any':(p,element)=>{
      let connector2=drawHistoryAnyConnector(element)

      
      svgAppend(p,connector2)
      return connector2;

    },'RALph:History-Any-Red':(p,element)=>{
      let connector2=drawHistoryAnyRedConnector(element)

      svgAppend(p,connector2)
      return connector2;

    },
    'RALph:History-Any-Green':(p,element)=>{
      let connector2=drawHistoryAnyGreenConnector(element)

      svgAppend(p,connector2)
      return connector2;

    },'RALph:History-Same-Green':(p,element)=>{
      let connector2=drawHistorySameGreenConnector(element)

      svgAppend(p,connector2)
      return connector2;

    },'RALph:History-Same-Red':(p,element)=>{
      let connector2=drawHistorySameRedConnector(element)

      svgAppend(p,connector2)
      return connector2;

    },'RALph:DelegateTo':(p,element)=>{
      let delegate=drawDelegateTo(element)
      
      svgAppend(p,delegate)
      return delegate;

    },'RALph:reportsTo':(p,element)=>{
      let report = drawReportsTo(element);

      svgAppend(p,report)
      return report;

    },'RALph:ResourceArc': (p, element) => {

      var attrs = computeStyle(attrs, {
        stroke:BLACK,//-> PARA EL COLOR
        strokeWidth: 0.5,
        //strokedashoffset: 153,
        /*Como definir history-source-another
        markerStart: marker('history-source-another-start', 'white',BLACK),*/
        //markerBetween: marker('history-source-another-end', 'white',BLACK),
        //strokeDasharray: [10,7]//->para poner como una linea por rayas
      });
      

      return svgAppend(p, createLine(element.waypoints, attrs));

    },

    'RALph:dataField':(p,element)=>{
      let dataField=drawDataField(element);

      svgAppend(p,dataField);

      return dataField;

    },
      'RALph:negatedAssignment': (p, element) => {
      var points=element.waypoints;
      var p1=points[0]
      var x = p1.x
      var y = p1.y

      var p2=points[points.length-1]
      var x2 = p2.x
      var y2 = p2.y
      var attrs = {
        strokeLinejoin: 'round',
        //markerStart: marker('negated2', 'white', element.color,x,y),
        //markerEnd: marker('negated', 'white', element.color,x,y,x2,y2),
        stroke: element.color || COLOR_RED,
        strokeWidth: 0.5,
      };

      var attrs2 = {
        strokeLinejoin: 'round',
        stroke: COLOR_RED,
        strokeWidth: 1,
      };

      svgAppend(p, drawCrossedLine(element.waypoints,attrs2));
      svgAppend(p, drawCrossedLine2(element.waypoints,attrs2));

      
      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'RALph:simpleArrow':(p, element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: marker('sequenceflow-end', 'white', element.color),
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        //strokeDasharray: [8,5]
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'RALph:doubleArrow':(p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: marker('doubleArrow', 'white', element.color),
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        //strokeDasharray: [8,5]
      };

      return svgAppend(p, createLine(element.waypoints, attrs));

    }
    
    ,'RALph:solidLine':(p,element)=>{
      var attrs = {
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        strokeLinejoin: 'round',
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'RALph:solidLineWithCircle':(p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        stroke: BLACK,
        strokeWidth: 0.5,
        markerEnd: marker('history-source-another-start', 'white',BLACK),
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'RALph:dashedLine':(p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        strokeDasharray: [8,5],
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'RALph:dashedLineWithCircle':(p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        strokeDasharray: [8,5],
        markerEnd: marker('history-source-another-start', 'white',BLACK),
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'RALph:ConsequenceFlow': (p, element) => {
      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: marker('sequenceflow-end', 'white', element.color),
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        //strokeDasharray: [8,5]
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'label': (p, element) => {
      return renderExternalLabel(p, element);
    },
  };

  /*
   function getConnectionPath(connection) {
     var waypoints = connection.waypoints.map(function(p) {
       return p.original || p;
     });
  
     var connectionPath = [
       ['M', waypoints[0].x, waypoints[0].y]
     ];
  
     waypoints.forEach(function(waypoint, index) {
       if (index !== 0) {
         connectionPath.push(['L', waypoint.x, waypoint.y]);
       }
     });
     return componentsToPath(connectionPath);
   }*/

  var paths = this.paths = {
    'RALph:TimeSlot': (shape) => {
      var x = shape.x,
          y = shape.y,
          width = shape.width,
          height = shape.height,
          borderRadius = 20;

      var roundRectPath = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];

      return componentsToPath(roundRectPath);
    },'RALph:ResourceArc':(element)=>{
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;
          

      var d = [
        ['M', x , y],
        ['h', 50 ],
        ['v', 50 ],
        ['h', -50 ],
        ['v', -50 ],
        ['z']
      ]

      return componentsToPath(d);
    },'RALph:negatedAssignment':(element)=>{
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;
          

      var d = [
        ['M', x , y],
        ['h', 60 ],
        ['v', 90 ],
        ['h', -50 ],
        ['v', -50 ],
        ['z']
      ]

      return componentsToPath(d);
    },'RALph:Rolecap':(element)=>{
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;
          

      var d = [
        ['M', x , y],
        ['h', 50 ],
        ['v', 50 ],
        ['h', -50 ],
        ['v', -50 ],
        ['z']
      ]

      return componentsToPath(d);
    },'RALph:RoleRALph':(element)=>{
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;
          

      var borderRadius = 20;

      var roundRectPath = [
            ['M', x + borderRadius, y],
            ['l', width - borderRadius * 2, 0],
            ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
            ['l', 0, height - borderRadius * 2],
            ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
            ['l', borderRadius * 2 - width, 0],
            ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
            ['l', 0, borderRadius * 2 - height],
            ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
            ['z']
      ];

      return componentsToPath(roundRectPath);


    },'RALph:DelegateTo':(element)=>{
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height,
          borderRadius=20;
      
      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];

      return componentsToPath(d);
    },
    'RALph:reportsTo':(element)=>{
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height,
          borderRadius=20;
      
      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];

      return componentsToPath(d);
    },
    'RALph:Position':(element)=>{
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height,
          borderRadius=20;

     var d = [
      ['M', x + borderRadius, y],
      ['l', width - borderRadius * 2, 0],
      ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
      ['l', 0, height - borderRadius * 2],
      ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
      ['l', borderRadius * 2 - width, 0],
      ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
      ['l', 0, borderRadius * 2 - height],
      ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
      ['z']
      ];

      return componentsToPath(d);

    },'RALph:Orgunit':(element) =>{
      var x = element.x,
        y = element.y,
        width = element.width,
        height = element.height,
        borderRadius=20;
        
      var d = [
          ['M', x + borderRadius, y],
          ['l', width - borderRadius * 2, 0],
          ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
          ['l', 0, height - borderRadius * 2],
          ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
          ['l', borderRadius * 2 - width, 0],
          ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
          ['l', 0, borderRadius * 2 - height],
          ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
          ['z']
       ];

      return componentsToPath(d);

  },'RALph:Personcap':(element) =>{
        var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height,
          borderRadius=20;

          
          var d = [
            ['M', x + borderRadius, y],
            ['l', width - borderRadius * 2, 0],
            ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
            ['l', 0, height - borderRadius * 2],
            ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
            ['l', borderRadius * 2 - width, 0],
            ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
            ['l', 0, borderRadius * 2 - height],
            ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
            ['z']
         ];

        return componentsToPath(d);

    },'RALph:Person':(element)=>{
        var x = element.x,
        y = element.y,
        width = element.width,
        height = element.height,
        borderRadius=20;
        
        var d = [
          ['M', x + borderRadius, y],
          ['l', width - borderRadius * 2, 0],
          ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
          ['l', 0, height - borderRadius * 2],
          ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
          ['l', borderRadius * 2 - width, 0],
          ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
          ['l', 0, borderRadius * 2 - height],
          ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
          ['z']
       ];

          return componentsToPath(d);

    },'RALph:History-Same':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=30;

      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
     ];


    return componentsToPath(d);

  },'RALph:History-Any':(element)=>{
    var x = element.x,
    y = element.y,
    width = element.width,
    height = element.height,
    borderRadius=30;
    
    var d = [
      ['M', x + borderRadius, y],
      ['l', width - borderRadius * 2, 0],
      ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
      ['l', 0, height - borderRadius * 2],
      ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
      ['l', borderRadius * 2 - width, 0],
      ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
      ['l', 0, borderRadius * 2 - height],
      ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
      ['z']
   ];

      return componentsToPath(d);
},'RALph:dataField':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=30;
    
      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
    ];

      return componentsToPath(d);

    },
    'label': (element) => {
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;

      var rectPath = [
        ['M', x, y],
        ['l', width, 0],
        ['l', 0, height],
        ['l', -width, 0],
        ['z']
      ];

      return componentsToPath(rectPath);
    },
    'RALph:History-Same-Red':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=30;
    
      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];

      return componentsToPath(d);

    },'RALph:History-Same-Green':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=30;
    
      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];

      return componentsToPath(d);

    },'RALph:History-Any-Green':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=30;
    
      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];

      return componentsToPath(d);

    },'RALph:History-Any-Red':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=30;
    
      var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];

      return componentsToPath(d);

    },'RALph:Complex-Assignment-OR':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=10;
    
      /*var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];*/
      var d = [
        ['M', x , y],
        ['h', 50 ],
        ['v', 50 ],
        ['h', -50 ],
        ['v', -50 ],
        ['z']
      ]

      return componentsToPath(d);

    
    },'RALph:Complex-Assignment-AND':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height,
      borderRadius=10;
    
      /*var d = [
        ['M', x + borderRadius, y],
        ['l', width - borderRadius * 2, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
        ['l', 0, height - borderRadius * 2],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
        ['l', borderRadius * 2 - width, 0],
        ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
        ['l', 0, borderRadius * 2 - height],
        ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
        ['z']
      ];*/
      var d = [
        ['M', x , y],
        ['h', 50 ],
        ['v', 50 ],
        ['h', -50 ],
        ['v', -50 ],
        ['z']
      ]

      return componentsToPath(d);

    }
  }
}

inherits(CustomRenderer, BaseRenderer);

//CustomRenderer.$inject = [ 'eventBus', 'styles', 'canvas', 'textRenderer' ];
CustomRenderer.$inject = [ 'eventBus', 'styles', 'canvas', 'textRenderer' ];

CustomRenderer.prototype.canRender = function(element) {
  return (/^RALph:/.test(element.type) || element.type === 'label') //|| (/^persons:/.test(element.type) || element.type === 'label') 
};

CustomRenderer.prototype.drawShape = function(p, element) {
  var type = element.type;
  var h = this.renderers[type];
  if(element.color == null)
    element.color= "#000"

  /* jshint -W040 */
  return h(p, element);
};

CustomRenderer.prototype.getShapePath = function(shape) {
  var type = shape.type;
  var h = this.paths[type];

  /* jshint -W040 */
  return h(shape);
};

CustomRenderer.prototype.drawConnection = function(p, element) {
  var type = element.type;
  var h = this.renderers[type];

  if(element.color == null)
    element.color='#000';
  /* jshint -W040 */
  return h(p, element);
};

CustomRenderer.prototype.getConnectionPath = function(connection) {
  // var type = connection.type;
  // var h = this.paths[type];
  //
  // /* jshint -W040 */
  // return h(connection);
  var waypoints = connection.waypoints.map(function(p) {
    return p.original || p;
  });

  var connectionPath = [
    ['M', waypoints[0].x, waypoints[0].y]
  ];

  
  waypoints.forEach(function(waypoint, index) {
    if (index !== 0) {
      connectionPath.push(['L', waypoint.x, waypoint.y]);
    }
  });

  return componentsToPath(connectionPath);

};
