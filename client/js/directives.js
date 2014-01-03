angular.module('scatterPlotApp.directives', [])
  .directive("scatterPlot", function() {
    return {
    restrict: 'A',
    link: function(scope, element, attrs){
      var clock = new THREE.Clock(),
          scatterPlot, camera, scene, renderer, mesh, meshes = [],
          stockData,
          height = parseInt(attrs.height),
          width = parseInt(attrs.width);

      scope.$watch('stockData', function (newValue) {
        if(newValue.content){ 
          stockData = newValue.content; 
          init();
          animate();
        }
      }, true);

      function init() {
        var numberOfSymbols = Object.keys(stockData.symbols).length;
        var sizeOfEachSymbolArray = stockData.date.length;

        scene = new THREE.Scene();

        //setting up camera 
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        camera.position.z = numberOfSymbols;
        camera.position.x = 0;
        camera.position.y = numberOfSymbols/4;

        scene.add(camera);

        //setting up scatterPlot
        scatterPlot = new THREE.Object3D();
        scatterPlot.rotation.y = 0.5;
        scatterPlot.add(constructLines(sizeOfEachSymbolArray/2.+1, -sizeOfEachSymbolArray/2.-1, 10, -10, numberOfSymbols/2.+1, -numberOfSymbols/2.-1));  
        
        var titles = ['2013-12-26', 'X: Time evolution(day) starting from 2013-01-01', 
                      'Y: Positive deviation( (Each datapoint - average)/average ) from the stock\'s average', 
                      'Negative deviation from the stock\'s average',
                      'Z: each Z value represent a stock symbol',
                      'stock symbol'],
            positions = [sizeOfEachSymbolArray/2.+20, -sizeOfEachSymbolArray/2.-20, 35, -35, numberOfSymbols/2.+10, -numberOfSymbols/2.-10];
        titleAxesAtPositions(titles, positions);

        var color = 0xff0000,
            pointGeo = createPointsGeometry(numberOfSymbols, sizeOfEachSymbolArray);
        createMesh(pointGeo, scene, color);

        scene.add(scatterPlot);
  

        //setting up renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColorHex(0xEEEEEE, 1.0);

        renderer.render(scene, camera);

        element.append(renderer.domElement);
        element.on('mousedown', onmousedown);
        element.on('mousemove', onmousemove);
        element.on('mouseup', onmouseup);
      }
      function animate() {
        requestAnimationFrame( animate, renderer.domElement);
        render();
      }
      var vertices, vertices_tmp, vl, d, vt, jl;
      function render() {
        update = clock.getElapsedTime() - elapsedTime > 1 ? false : true;
        if(update){
          renderer.clear();
          jl = meshes.length
          for (var j = 0; j < jl; j++) {
            data = meshes[ j ];
            mesh = data.mesh;
            vertices = data.vertices;
            vertices_tmp = data.vertices_tmp;
            vl = data.vl;
            mesh.geometry.verticesNeedUpdate = true;
          }
          camera.lookAt(scene.position);
          renderer.render(scene, camera);
        } 
      }

      function createPointsGeometry (numberOfSymbols, sizeOfEachSymbolArray){
        var pointCount = numberOfSymbols * sizeOfEachSymbolArray;
            pointGeo = new THREE.Geometry(),
            index = 0,
            average = 0;

        for (var key in stockData.symbols) {
          average = averageOfTheStock(stockData.symbols[key]);
          for (var i = 0; i < stockData.symbols[key].length; i++){
            var x = i - sizeOfEachSymbolArray/2.,
                y = stockData.symbols[key][i] == 0 ? 0 : (stockData.symbols[key][i]-average) / average * 100,
                z = index - numberOfSymbols/2.;
            pointGeo.vertices.push(v(x, y, z));
          }
          index++;   
        }
        return pointGeo;
      }
      function createMesh(originalGeometry, scene, color) {
        var i, c;

        var vertices = originalGeometry.vertices;
        var vl = vertices.length;

        var geometry = new THREE.Geometry();
        var vertices_tmp = [];

        for (i = 0; i < vl; i++) {
          geometry.vertices[i] = v(vertices[i].x, vertices[i].y, vertices[i].z);
          vertices_tmp[i] = [ vertices[i].x, vertices[i].y, vertices[i].z, 0, 0 ];
        }

        mesh = new THREE.ParticleSystem(geometry, new THREE.ParticleBasicMaterial({ size:1.5, color:color }));

        scatterPlot.add(mesh);

        meshes.push({
          mesh:mesh,
          vertices:geometry.vertices,
          vertices_tmp:vertices_tmp,
          vl:vl,
          down:0,
          up:0,
          direction:-1,
          speed:{ up:15, down:20},
          started:false,
          dynamic:true
        });
      }

      function createTextCanvas(text, color, font, size) {
        size = size || 24;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var fontStr = (size + 'px ') + (font || 'Arial');
        ctx.font = fontStr;
        var w = ctx.measureText(text).width;
        var h = Math.ceil(size);
        canvas.width = w;
        canvas.height = h;
        ctx.font = fontStr;
        ctx.fillStyle = color || 'black';
        ctx.fillText(text, 0, Math.ceil(size * 0.8));
        return canvas;
      }

      function createText2D(text, color, font, size, segW, segH) {
        var canvas = createTextCanvas(text, color, font, size),
            plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH),
            tex = new THREE.Texture(canvas);
        tex.needsUpdate = true;
        var planeMat = new THREE.MeshBasicMaterial({
          map:tex,
          color:0xffffff,
          transparent:true
        });
        var mesh = new THREE.Mesh(plane, planeMat);
        mesh.scale.set(0.25, 0.25, 0.25);
        mesh.doubleSided = true;
        return mesh;
      }


      var elapsedTime = 0; 
      // update the clock related information to save from over-rendering
      function updateClockInfo(){
        update = clock.getDelta() < 1 ? true: false;
        elapsedTime = clock.getElapsedTime();
      }

      //Events
      var sx = 0, sy = 0,
          update = false,
          down = false;
      
      function onmousedown(event) {
        updateClockInfo();
        down = true;
        sx = event.clientX;
        sy = event.clientY;
      }

      function onmouseup(event) {
        updateClockInfo();
        down = false;
      }

      function onmousemove(event) {
        updateClockInfo();
        if (down) {
          var dx = event.clientX - sx;
          var dy = event.clientY - sy;
          scatterPlot.rotation.y += dx * 0.01;
          camera.position.y += dy;
          sx += dx;
          sy += dy;
        }
      }

      //helper functions
      function averageOfTheStock(data){
        var length = data.length;
        var sum = 0;
        for(var i = 0; i < length; i++){
          sum += data[i];
        } 
        return sum/length;
      } 
      function v(x, y, z) {
        return new THREE.Vector3(x, y, z);
      }
      //draw lines betwen the vertices
      //uncomment to draw the lines of a 2 by 2 cubic box 
      function constructLines(x_hi, x_lo, y_hi, y_lo, z_hi, z_lo){
        var lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(
          v(x_lo, 0, 0), v(x_hi, 0, 0),
  //        v(0, y_lo, 0), v(0, y_hi, 0),
          v(0, 0, z_lo), v(0, 0, z_hi),
  //        v(x_lo, y_hi, z_lo), v(x_hi, y_hi, z_lo),
  //        v(x_lo, y_lo, z_lo), v(x_hi, y_lo, z_lo),
  //        v(x_lo, y_hi, z_hi), v(x_hi, y_hi, z_hi),
  //        v(x_lo, y_lo, z_hi), v(x_hi, y_lo, z_hi),
          v(x_lo, 0, z_hi), v(x_hi, 0, z_hi),
          v(x_lo, 0, z_lo), v(x_hi, 0, z_lo),
  //        v(x_lo, y_hi, 0), v(x_hi, y_hi, 0),
  //        v(x_lo, y_lo, 0), v(x_hi, y_lo, 0),
  //        v(x_hi, y_lo, z_lo), v(x_hi, y_hi, z_lo),
  //        v(x_lo, y_lo, z_lo), v(x_lo, y_hi, z_lo),
  //        v(x_hi, y_lo, z_hi), v(x_hi, y_hi, z_hi),
  //        v(x_lo, y_lo, z_hi), v(x_lo, y_hi, z_hi),
  //        v(0, y_lo, z_hi), v(0, y_hi, z_hi),
  //        v(0, y_lo, z_lo), v(0, y_hi, z_lo),
  //        v(x_hi, y_lo, 0), v(x_hi, y_hi, 0),
  //        v(x_lo, y_lo, 0), v(x_lo, y_hi, 0),
  //        v(x_hi, y_hi, z_lo), v(x_hi, y_hi, z_hi),
  //        v(x_hi, y_lo, z_lo), v(x_hi, y_lo, z_hi),
  //        v(x_lo, y_hi, z_lo), v(x_lo, y_hi, z_hi),
  //        v(x_lo, y_lo, z_lo), v(x_lo, y_lo, z_hi),
          v(x_lo, 0, z_lo), v(x_lo, 0, z_hi),
          v(x_hi, 0, z_lo), v(x_hi, 0, z_hi)
  //        v(0, y_hi, z_lo), v(0, y_hi, z_hi),
  //        v(0, y_lo, z_lo), v(0, y_lo, z_hi)
        );
        var lineMat = new THREE.LineBasicMaterial({color:0x808080, lineWidth:20});
        var line = new THREE.Line(lineGeo, lineMat);
        line.type = THREE.Lines;
        return line;
      } 
      function titleAxesAtPositions(titles, positions) {
        var title;
        title = createText2D(titles[0])
        title.position.x = positions[0];
        scatterPlot.add(title);
        title = createText2D(titles[1]);
        title.position.x = positions[1];
        scatterPlot.add(title);
        title = createText2D(titles[2]);
        title.position.y = positions[2];
        scatterPlot.add(title);
        title = createText2D(titles[3]);
        title.position.y = positions[3];
        scatterPlot.add(title);
        title = createText2D(titles[4]);
        title.position.z = positions[4];
        scatterPlot.add(title);
        title = createText2D(titles[5]);
        title.position.z = positions[5];
        scatterPlot.add(title);
      }
    }
  }
});
