import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import BpmnRenderer from "bpmn-js/lib/draw/BpmnRenderer";

import {componentsToPath, createLine} from 'diagram-js/lib/util/RenderUtil';
import {query as domQuery} from 'min-dom';
import Cat from './cat';
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

    // fix for safari / chrome / firefox bug not correctly
    // resetting stroke dash array
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

  function marker(type, fill, stroke) {
    var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

    if (!markers[id]) {
      createMarker(id, type, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  function createMarker(id, type, fill, stroke) {

    if (type === 'sequenceflow-end') {
      var sequenceflowEnd = svgCreate('path');
      svgAttr(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5,
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


    if(type === "test"){
      var dobleFlecha=svgCreate('path');
      //M 236.635 473.415 L 203.53 428.339 L 437.624 256.411 L 203.53 84.49 L 236.634 39.413 L 501.417 233.872 C 508.591 239.14 512.828 247.509 512.828 256.41 C 512.828 265.309 508.591 273.681 501.417 278.948 L 236.635 473.415 Z'});
      //svgAttr(dobleFlecha,{d: 'M 33.105 473.415 L 0 428.339 L 234.096 256.411 L 0 84.49 L 33.104 39.413 L 297.889 233.872 C 305.063 239.141 309.3 247.51 309.3 256.411 C 309.3 265.311 305.063 273.681 297.889 278.949 L 33.105 473.415 Z M 236.635 473.415 L 203.53 428.339 L 437.624 256.411 L 203.53 84.49 L 236.634 39.413 L 501.417 233.872 C 508.591 239.14 512.828 247.509 512.828 256.41 C 512.828 265.309 508.591 273.681 501.417 278.948 L 236.635 473.415 Z'});
      svgAttr(dobleFlecha,{d:'M 0 0 L 3 3 L 0 6 M 3 6 L 6 3 L 3 0'})//svgAttr(dobleFlecha,{d:'M 0 0 L 8 3 L 0 6 M 5 6 L 10 3 L 5 0'})
      /*
      var d = [
        ['M', 33.105 , 473.415],
        ['l', 0, 428.339],
        ['l',234.096,256.411 ],
        ['l',0,84.49],
        ['l',33.104,39.413],
        ['l', 297.889, 233.872],
        ['c', 305.063 ,239.141 ,309.3 ,247.51 ,309.3, 256.411], 
        ['c', 309.3, 265.311, 305.063, 273.681, 297.889, 278.949],
        ['l', 33.105, 473.415],
        ['z']
      ]
      var comp=componentsToPath(d);
      svgAttr(dobleFlecha,comp);
      */
  
      addMarker(id, {
        element: dobleFlecha,
        attrs: {
          //stroke: stroke
        },
        ref: {x:6,y:3}//{ x: 10, y: 5},
        //scale: 0.5
      });

    }

    if(type === "negated"){
      var dobleFlecha=svgCreate('path');
      //M 236.635 473.415 L 203.53 428.339 L 437.624 256.411 L 203.53 84.49 L 236.634 39.413 L 501.417 233.872 C 508.591 239.14 512.828 247.509 512.828 256.41 C 512.828 265.309 508.591 273.681 501.417 278.948 L 236.635 473.415 Z'});
      //svgAttr(dobleFlecha,{d: 'M 33.105 473.415 L 0 428.339 L 234.096 256.411 L 0 84.49 L 33.104 39.413 L 297.889 233.872 C 305.063 239.141 309.3 247.51 309.3 256.411 C 309.3 265.311 305.063 273.681 297.889 278.949 L 33.105 473.415 Z M 236.635 473.415 L 203.53 428.339 L 437.624 256.411 L 203.53 84.49 L 236.634 39.413 L 501.417 233.872 C 508.591 239.14 512.828 247.509 512.828 256.41 C 512.828 265.309 508.591 273.681 501.417 278.948 L 236.635 473.415 Z'});
      svgAttr(dobleFlecha,{d:'M 0 10 L 10 0'})//svgAttr(dobleFlecha,{d:'M 0 0 L 8 3 L 0 6 M 5 6 L 10 3 L 5 0'})
      //version cutre: M 0 0 L 1 2 L 3 6 V 0 L 0 6
  
      addMarker(id, {
        element: dobleFlecha,
        attrs: {
          stroke: 'red'
        },
        ref: {x:55,y:5},//{ x: 10, y: 5},
        orient:'auto'
      });

    }

    if(type === "negated2"){
      var dobleFlecha=svgCreate('path');
      //M 236.635 473.415 L 203.53 428.339 L 437.624 256.411 L 203.53 84.49 L 236.634 39.413 L 501.417 233.872 C 508.591 239.14 512.828 247.509 512.828 256.41 C 512.828 265.309 508.591 273.681 501.417 278.948 L 236.635 473.415 Z'});
      //svgAttr(dobleFlecha,{d: 'M 33.105 473.415 L 0 428.339 L 234.096 256.411 L 0 84.49 L 33.104 39.413 L 297.889 233.872 C 305.063 239.141 309.3 247.51 309.3 256.411 C 309.3 265.311 305.063 273.681 297.889 278.949 L 33.105 473.415 Z M 236.635 473.415 L 203.53 428.339 L 437.624 256.411 L 203.53 84.49 L 236.634 39.413 L 501.417 233.872 C 508.591 239.14 512.828 247.509 512.828 256.41 C 512.828 265.309 508.591 273.681 501.417 278.948 L 236.635 473.415 Z'});
      svgAttr(dobleFlecha,{d:'M 0 0 L 10 10'})//svgAttr(dobleFlecha,{d:'M 0 0 L 8 3 L 0 6 M 5 6 L 10 3 L 5 0'})
      //version cutre: M 0 0 L 1 2 L 3 6 V 0 L 0 6
  
      addMarker(id, {
        element: dobleFlecha,
        attrs: {
          stroke: 'red'
        },
        ref: {x:-55,y:4},//{ x: 10, y: 5},
        orient:'auto'
        //scale: 0.5
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

  function drawNyanCat(shape){

    var catGfx = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataURL3
    });

    return  catGfx;
  }

  function drawPosition(shape){

    var pos = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataPosition
    });

    return pos;
  }

  function drawPerson(shape){
    var person = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataURLpersonSVG
    });

    return  person;
  }

  function drawDelegateTo(shape){
    var delegate = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataCanDelegate
    });

    return delegate;
  }

  function drawRoleRALph(shape){
    var role = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataURLrole
    });

    return role;
  }

  function drawPersoncap(shape){
    var cap = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataPersonCap
    });

    return cap;
  }

  function drawOrgunit(shape){
    var org = svgCreate('image', {
      x: 0,
      y: 0,
      width: shape.width,
      height: shape.height,
      href:Cat.dataOrgUnit
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

  function drawTimeDistanceArc(p, element, options) {
    var pathData = createPathFromConnection(element);
    var attrs = {
      strokeLinejoin: 'round',
      stroke: element.color || BLACK,
      strokeWidth: 1.5
    };

    attrs = assign(attrs, options)

    return drawPath(p, pathData, attrs);
  }

  var renderers = this.renderers = {
    'custom:TimeSlot': (p, element) => {
      let polygon = drawTimeSlot(element.width, element.height, element.color)
      renderExternalLabel(p,element)
      //renderEmbeddedLabel(p, element, 'center-middle');

      return polygon;
    },
    'custom:nyanCat':(p,element) =>{
      let cat=drawNyanCat(element)

      renderEmbeddedLabel(p,element,'center-middle')
      svgAppend(p,cat)
      return cat;

    },
    'custom:Position':(p,element) =>{
      let pos=drawPosition(element)

      svgAppend(p,pos)
      renderEmbeddedLabel(p,element,'center-middle')
      return pos;

    },
    'custom:Orgunit':(p,element) =>{
      let org=drawOrgunit(element)

      svgAppend(p,org)
      //renderExternalLabel(p,element)
      renderEmbeddedLabel(p,element,'center-middle')

      return org;

    },'custom:Personcap':(p,element) =>{
      let cap=drawPersoncap(element)

      svgAppend(p,cap)
      renderExternalLabel(p,element)

      return cap;

    },'custom:Person':(p,element)=>{
        let person=drawPerson(element)

        renderEmbeddedLabel(p,element,'center-middle')
        svgAppend(p,person)
        return person;

    },'custom:RoleRALph':(p,element)=>{
        let role=drawRoleRALph(element)

        renderEmbeddedLabel(p,element,'center-middle')
        svgAppend(p,role)
        return role;
    },'custom:History-Same':(p,element)=>{
      let connector=drawHistoryConnector(element)

      renderEmbeddedLabel(p,element,'center-middle')
      svgAppend(p,connector)
      return connector;
    },'custom:History-Any':(p,element)=>{
      let connector2=drawHistoryAnyConnector(element)

      renderEmbeddedLabel(p,element,'center-middle')
      svgAppend(p,connector2)
      return connector2;
    },'custom:DelegateTo':(p,element)=>{
      let delegate=drawDelegateTo(element)

      svgAppend(p,delegate)
      return delegate;
    },
    'custom:Clock': (p, element) => {
      console.log(element)
      var attrs = computeStyle(attrs, {
        stroke: element.color,
        strokeWidth: 2,
        fill: '#fff'
      });

      var path = svgCreate('path');

      var d = [
        ['M', 0 , 0],
        ['h', 50 ],
        ['v', 50 ],
        ['h', -50 ],
        ['v', -50 ],
        ['h', 5 ],
        ['m', 0, 5],
        ['h', 40 ],
        ['v', 40 ],
        ['h', -40 ],
        ['v', -40 ],
        ['h', 20 ],
        ['m', 0, 1],
        ['a', 15, 15, 79, 0, 0, 0, 38],
        ['a', 15, 15, 79, 0, 0, 0, -38],
        ['m', 0 , 19],
        ['l', 5, -10 ],
        ['m', -5 , 10],
        ['l', 12, 10 ],
        ['z']
      ]

      svgAttr(path, {
        width: element.width,
        height: element.height,
        color: element.color || '#fff',
        d: componentsToPath(d)
      });

      svgAttr(path, attrs);

      svgAppend(p, path);

      return path;
    },
    'custom:Resource': (p, element) => {
      var attrs = computeStyle(attrs, {
        stroke: element.color || BLACK,
        strokeWidth: 2,
        strokeLinecap: 'round',
        fill: '#fff'
      });

      var path = svgCreate('path');

      var d = [
        ['M', 30 , 8],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['M', 20 , 8],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['M', 20 , 17],
        ['h', 10 ],
        ['M', 35 , 25],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['z']
      ];

      svgAttr(path, {
        width: element.width,
        height: element.height,
        d: componentsToPath(d),
        id: 'Resource_' + rendererId
      });

      svgAttr(path, attrs);

      svgAppend(p, path);

      return path;
    },
    'custom:ResourceAbsence': (p, element) => {
      var attrs = computeStyle(attrs, {
        stroke: element.color || BLACK,
        strokeWidth: 2,
        fill: '#fff'
      });

      var path = svgCreate('path');

      var d = [
        ['M', 30 , 8],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['M', 20 , 8],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['M', 20 , 17],
        ['h', 10 ],
        ['M', 35 , 25],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['M', -5 , -5],
        ['l', 60, 85],
        ['M', 55 , -5],
        ['l', -60, 85],
        ['z']
      ]

      svgAttr(path, {
        width: element.width,
        height: element.height,
        d: componentsToPath(d)
      });

      svgAttr(path, attrs);

      svgAppend(p, path);

      return path;
    },
    'custom:Role': (p, element) => {

      var attrs = computeStyle(attrs, {
        stroke: element.color || BLACK,
        strokeWidth: 2,
        fill: '#fff'
      });

      var path = svgCreate('path');

      var d = [
        ['M', 54 , 78],
        ['v', -78],
        ['h', -54],
        ['v', 78],
        ['h', 54],
        ['v', -5],
        ['M', 32 , 11],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['m', -10 , 0],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['m', 0 , 9],
        ['h', 10 ],
        ['m', 5 , 8],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['z']
      ];

      svgAttr(path, {
        width: element.width,
        height: element.height,
        d: componentsToPath(d)
      });

      svgAttr(path, attrs);

      svgAppend(p, path);

      return path;
    },
    'custom:RoleAbsence': (p, element) => {

      var attrs = computeStyle(attrs, {
        stroke: element.color || BLACK,
        strokeWidth: 2,
        fill: '#fff'
      });

      var path = svgCreate('path');

      var d = [
        ['M', 54 , 78],
        ['v', -78],
        ['h', -54],
        ['v', 78],
        ['h', 54],
        ['v', -5],
        ['M', 32 , 11],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['m', -10 , 0],
        ['a', 1, 1, 0, 1, 0, 0, 3],
        ['a', 1, 1, 0, 1, 0, 0, -3],
        ['m', 0 , 9],
        ['h', 10 ],
        ['m', 5 , 8],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['M', 0 , 0],
        ['l', 54, 78],
        ['M', 54 , 0],
        ['l', -54, 78],
        ['z']
      ]

      svgAttr(path, {
        width: element.width,
        height: element.height,
        d: componentsToPath(d)
      });

      svgAttr(path, attrs);

      svgAppend(p, path);

      return path;
    },
    'custom:Group': (p, element, bool=false) => {
      var attrs = computeStyle(attrs, {
        stroke: element.color || BLACK,
        strokeWidth: 2,
        fill: '#fff'
      });
      var inner = svgCreate('svg')
      var path1 = svgCreate('path');
      var path2 = svgCreate('path');

      var d1 = [
        ['M', 42 , 26],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['z']
      ]

      var d2 = [
        ['M', 37 , 28],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['z']
      ]

      if(bool) {
        d2 = d2.concat([
          ['M', -5 , -5],
          ['l', 65, 90],
          ['M', 60 , -5],
          ['l', -65, 90],
        ])
      }
      svgAttr(inner, {
        width: element.width,
        height: element.height
      });
      svgAttr(path1, {
        width: element.width-5,
        height: element.height-2,
        d: componentsToPath(d1)
      });
      svgAttr(path2, {
        width: element.width-5,
        height: element.height-2,
        d: componentsToPath(d2)
      });

      svgAttr(path1, attrs);
      svgAttr(path2, attrs);

      svgAppend(inner, path1);
      svgAppend(inner, path2);

      svgAppend(p, inner);

      return inner;
    },
    'custom:GroupAbsence': (p, element) => {
      return renderers['custom:Group'](p, element, true)
    },
    // 'custom:TaskTimed': (p, element) => {
    //   var attrs = {
    //     fill: '#fff',
    //     stroke: '#000'
    //   };
    //   let new_element = Object.assign({type: 'bpmn:Activity'}, element)
    //   var rect = BpmnRenderer.prototype.drawShape(p, new_element);
    //   console.log(rect)
    //   // renderEmbeddedLabel(p, element, 'center-middle');
    //   // attachTaskMarkers(parentGfx, element);
    //
    //   return rect;
    // },
    'custom:ResourceArc': (p, element) => {

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

    'custom:ResourceArc2': (p, element) => {
      var attrs = computeStyle(attrs, {
        stroke: COLOR_RED,
        strokeWidth: 1.5
        /*strokeWidth: 1.5,
        strokeDasharray: [10,7]*/
      });
      
      return svgAppend(p, createLine(element.waypoints, attrs));


    },  
    
    'custom:negatedAssignment': (p, element) => {

      var attrs = {
        strokeLinejoin: 'round',
        markerStart: marker('negated2', 'white', element.color),
        markerEnd: marker('negated', 'white', element.color),
        stroke: element.color || BLACK,
        strokeWidth: 1.5,
      };

      return svgAppend(p, createLine(element.waypoints, attrs));

    },
    
    'custom:solidLine':(p,element)=>{
      var attrs = {
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        strokeLinejoin: 'round',
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'custom:solidLineWithCircle':(p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        stroke: BLACK,
        strokeWidth: 0.5,
        markerEnd: marker('history-source-another-start', 'white',BLACK),
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'custom:dashedLine':(p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        strokeDasharray: [8,5],
       // markerEnd: marker('history-source-another-start', 'white',BLACK),
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'custom:dashedLineWithCircle':(p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        stroke: element.color || BLACK,
        strokeWidth: 0.5,
        strokeDasharray: [8,5],
        markerEnd: marker('history-source-another-start', 'white',BLACK),
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'custom:ConsequenceFlow': (p, element) => {
      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: marker('sequenceflow-end', 'white', element.color),
        stroke: element.color || BLACK,
        strokeWidth: 1.5,
        //strokeDasharray: [8,5]
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'custom:reportsTo': (p,element)=>{
      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: marker('test', 'white', element.color),
        stroke: element.color || BLACK,
        strokeWidth: 1.5,
      };

      return svgAppend(p, createLine(element.waypoints, attrs));
    },
    'custom:TimeDistanceArcStart': (p, element) => {
      var attrs = {
        markerStart: marker('timedistance-start', 'white', element.color),
      };

      return drawTimeDistanceArc(p, element, attrs)

    },
    'custom:TimeDistanceArcEnd': (p, element) => {
      var attrs = {
        markerEnd: marker('timedistance-end', 'blue', element.color),
      };

      return drawTimeDistanceArc(p, element, attrs)

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
    'custom:TimeSlot': (shape) => {
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
    },'custom:nyanCat':(element)=>{
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
    },'custom:ResourceArc':(element)=>{
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
    },'custom:ResourceArc2':(element)=>{
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
    },'custom:Rolecap':(element)=>{
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
    },'custom:RoleRALph':(element)=>{
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


    },'custom:DelegateTo':(p,element)=>{
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
    },
    'custom:Position':(element)=>{
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

    },'custom:Orgunit':(element) =>{
      var x = element.x,
        y = element.y,
        width = element.width,
        height = element.height;
        
        var d = [
          ['M', x , y],
          ['h', 55 ],
          ['v', 50 ],
          ['h', -50 ],
          ['v', -30 ],
          ['z']
        ]

      return componentsToPath(d);

  },'custom:Personcap':(element) =>{
        var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;
          
          var d = [
            ['M', x , y],
            ['h', 50 ],
            ['v', 50 ],
            ['h', -50 ],
            ['v', -30 ],
            ['z']
          ]

        return componentsToPath(d);

    },'custom:Person':(element)=>{
        var x = element.x,
        y = element.y,
        width = element.width,
        height = element.height;
        
        var d = [
          ['M', x , y],
          ['h', 50 ],
          ['v', 50 ],
          ['h', -50 ],
          ['v', -30 ],
          ['z']
        ]

          return componentsToPath(d);
    },'custom:History-Same':(element)=>{
      var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height;
      
      var d = [
        ['M', x , y],
        ['h', 50 ],
        ['v', 50 ],
        ['h', -50 ],
        ['v', -30 ],
        ['z']
      ]

        return componentsToPath(d);
  },'custom:History-Any':(element)=>{
    var x = element.x,
    y = element.y,
    width = element.width,
    height = element.height;
    
    var d = [
      ['M', x , y],
      ['h', 50 ],
      ['v', 50 ],
      ['h', -50 ],
      ['v', -30 ],
      ['z']
    ]

      return componentsToPath(d);
},
'custom:Clock': (element) => {
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
    },
    'custom:Resource': (element) => {
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;

      var resourcePath = [
        ['M', x+35 , y+25],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['z']
      ];

      return componentsToPath(resourcePath);
    },
    'custom:ResourceAbsence': (element) => {
      return paths['custom:Resource'](element)
    },
    'custom:Role': (element) => {
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;


      var resourcePath = [
        ['M', x , y],
        ['v', 78],
        ['h', 54],
        ['v', -78],
        ['h', -54],
        ['z']
      ];

      return componentsToPath(resourcePath);
    },
    'custom:RoleAbsence': (element) => {
      return paths['custom:Role'](element)
    },
    'custom:Group': (element) => {
      var x = element.x,
          y = element.y,
          width = element.width,
          height = element.height;

      var resourcePath = [
        ['M', x+42 , y+26],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['M', x+37 , y+28],
        ['a', 14, 14, 79, 0, 0, 5, -10],
        ['a', 6, 6, 79, 0, 0, -30, 0],
        ['a', 14, 14, 79, 0, 0, 5, 10],
        ['a', 60, 60, 0, 0, 0, -15, 50],
        ['h', 50 ],
        ['a', 60, 60, 0, 0, 0, -15, -50],
        ['z']
      ];

      return componentsToPath(resourcePath);
    },
    'custom:GroupAbsence': (element) => {
      return paths['custom:Group'](element)
    },
    // 'custom:ResourceArc': (connection) => {
    //   return getConnectionPath(connection)
    // },
    // 'custom:ConsequenceFlow': (connection) => {
    //   return paths['custom:ResourceArc'](connection)
    // },
    // 'custom:TimeDistance': (connection) => {
    //   return paths['custom:ResourceArc'](connection)
    // },
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
    }
  }
}

inherits(CustomRenderer, BaseRenderer);

//CustomRenderer.$inject = [ 'eventBus', 'styles', 'canvas', 'textRenderer' ];
CustomRenderer.$inject = [ 'eventBus', 'styles', 'canvas', 'textRenderer' ];

CustomRenderer.prototype.canRender = function(element) {
  return (/^custom:/.test(element.type) || element.type === 'label') //|| (/^persons:/.test(element.type) || element.type === 'label') 
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
