# ***RALph***
RALph is an independent graphical notation for the assignment of human resources to BP activities, which can be seamlessly integrated with BPMN (you can find more information about RALph in this link: https://link.springer.com/chapter/10.1007%2F978-3-319-19069-3_4). In this repository RALph has been implemented using the framework of BPMN io (https://github.com/bpmn-io) as BPMN editor. 

### Installation
To use this editor you should install first Visual Studio Code (https://code.visualstudio.com/) and NodeJS (https://nodejs.org/es/). After that, you can download the project, and you should execute "npm install" in a console of Visual Studio Code. Finally, you can execute "npm run dev" and a tab will open in your browser with the editor.


### How to extend RALph:
If you want to extend RALph, you will have to modify some files depending on what you want to change(in each section there is an explained example):

Icons:
  If you want to add new icons to the editor, you will have to change these files:
  - index.html: if you want to add new icons, you will have to code a svg image to ready for css using this conversor https://yoksel.github.io/url-encoder/
  - RALphPalette.js: if you want to assing new icons to the editor palette, you will to assign the icons of the index.html to a certain object.
  - RALphContextPadProvider: if you want to modify or add a sub palette to an object, you will to have to add it here.
  

Shapes:
  If you want to create and render new shapes in the diagram, you should use a svg of that shape and you will have to modify these files:
  - SVGs/index.js: it states the svgs in a base 64 format. I recommend you formatting a svg to base64 using this page:https://base64.guru/converter/encode/image/svg
  - RALphElementFactory: it states the properties and dimensions of the objects of RALph.
  - RALphRenderer.js: it states the shapes to render depending on the object.

  Additionally, if you want to add connectivity to a new shape you will have to modify these files:
  - Types.js:it classifies objects into groups.
  - RALphRules.js: it declares the connections of each object group.
  

Connections:
  If you want to create new connections you will have to modify these files:
  - Types.js: it also states what is a connection.
  - RALphRenderer.js: it states the form of the connection.
  - RALphConnect.js: if you need complex connections (involves a shape and a connection), you will have to modify this file,
    declaring what happens when you create that complex connection.
    
Finally, if you want to change the overlapping order, you will have to change RALphOrderingProvider.

