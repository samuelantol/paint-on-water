<template>
</template>


<script setup>
    import { fabric } from 'fabric'
    import { useMainStore } from '../stores/MainStore'
    
    import { onMounted } from 'vue'

    const mainStore = useMainStore();

    var idPath = 0;
    var idDrop = 0;

    // scale = size of virtual artboard / real canvas size in px
    mainStore.scaleView = mainStore.artboardSize.x / cmToPx(mainStore.canvasSize.x);

    // size of one side of polygon
    const STEP = 10;

    // THIS FUNCTION TRANSFORMS DIFFERENT SVG SHAPES TO POLYGONS (ARRAY OF POINTS)
    function makePolygons(obj) {
        mainStore.pathNames.push({id: idPath, type: obj.type});
        //settingsStore.pathSettings.push({ id: idPath, speedStart: 3, speedEnd: 3, needleHeight: 200 });

        if (obj.type === "path") {
            let points = polygonSampledFromPath(obj.d);
            mainStore.rawPaths.push(points);
        }
        else if (obj.type === "line") {
            // create points (=steps) between start and end point of line
            let samples = Math.round(polygonLength([[obj.x1, obj.y1], [obj.x2, obj.y2]]) / STEP);
            let points = sampledLine([obj.x1, obj.y1], [obj.x2, obj.y2], samples)
            mainStore.rawPaths.push(points);
        }
        else if (obj.type === "polyline") {
            let points = [];
            for (let i = 0; i < obj.points.length-1; i++) {
                // create points (=steps) between start and end point of each line in polyline
                let samples = Math.round(polygonLength([[obj.points[i].x, obj.points[i].y], [obj.points[i+1].x, obj.points[i+1].y]]) / STEP);
                let linePoints = sampledLine([obj.points[i].x, obj.points[i].y], [obj.points[i+1].x, obj.points[i+1].y], samples) // with steps
                points = points.concat(linePoints);
            }
            mainStore.rawPaths.push(points);
        }
        else if (obj.type === "polygon") {
            let points = [];
            for (let i = 0; i < obj.points.length-1; i++) {
                let samples = Math.round(polygonLength([[obj.points[i].x, obj.points[i].y], [obj.points[i+1].x, obj.points[i+1].y]]) / STEP);
                let linePoints = sampledLine([obj.points[i].x, obj.points[i].y], [obj.points[i+1].x, obj.points[i+1].y], samples) // with steps
                points = points.concat(linePoints);
            }
            // closing the shape - connecting last point and first point (difference between polygon and polyline)
            let samples = Math.round(polygonLength([[obj.points[obj.points.length-1].x, obj.points[obj.points.length-1].y], [obj.points[0].x, obj.points[0].y]]) / STEP);
            let linePoints = sampledLine([obj.points[obj.points.length-1].x, obj.points[obj.points.length-1].y], [obj.points[0].x, obj.points[0].y], samples) // with steps
            points = points.concat(linePoints);
            mainStore.rawPaths.push(points);
        }
        //!!! CIRCLE is used for DROPS // not processed as PATH
        else if (obj.type === "circle") {
            const center = [obj.group.viewBoxWidth/2 + obj.left + obj.radius, obj.group.viewBoxHeight/2 + obj.top + obj.radius];
            mainStore.drops.push(center);

            if (obj.fill === '#FF0000') {
                mainStore.dropsColor.push({id: idDrop, color: obj.fill, colorCode: 0}); //red
            } else if (obj.fill === '#00FF00') {
                mainStore.dropsColor.push({id: idDrop, color: obj.fill, colorCode: 1}); //green
            } else if (obj.fill === '#0000FF') {
                mainStore.dropsColor.push({id: idDrop, color: obj.fill, colorCode: 2}); //blue
            } else if (obj.fill === '#FFFFFF') {
                mainStore.dropsColor.push({id: idDrop, color: obj.fill, colorCode: 3}); //white
            } else if (obj.fill === '#000000') {
                mainStore.dropsColor.push({id: idDrop, color: obj.fill, colorCode: 4}); //black
            }
            idDrop++;

            mainStore.pathNames.pop();
            idPath--;
        }
        else if (obj.type === "ellipse") {
            // needed to redefine top left corner as point 00 and CENTER point of circle
            const center = [obj.group.viewBoxWidth/2 + obj.left + obj.rx, obj.group.viewBoxHeight/2 + obj.top + obj.ry];
            let points = [];
            var radius = Math.min(obj.rx, obj.ry);
            var newStep = adjustStep(STEP, 2*Math.PI*radius);
            var samples = 2*Math.PI*radius / newStep;
            var circleStep = 2*Math.PI / samples;
            for (var i = 0; i <= 2*Math.PI; i += circleStep) {
                let x = obj.rx * Math.sin(i) + center[0];
                let y = obj.ry * Math.cos(i) + center[1];
                points.push([x, y]);
            }
            points.push(points[0]);
            mainStore.rawPaths.push(points);
        }
        else if (obj.type === "rect") {
            // needed to redefine top left corner as point 00
            const a = [obj.viewBoxWidth/2 + obj.lineCoords.tl.x, obj.viewBoxHeight/2 + obj.lineCoords.tl.y];
            const b = [obj.viewBoxWidth/2 + obj.lineCoords.tr.x, obj.viewBoxHeight/2 + obj.lineCoords.tr.y];
            const c = [obj.viewBoxWidth/2 + obj.lineCoords.br.x, obj.viewBoxHeight/2 + obj.lineCoords.br.y];
            const d = [obj.viewBoxWidth/2 + obj.lineCoords.bl.x, obj.viewBoxHeight/2 + obj.lineCoords.bl.y];
            let originalPoints = [a,b,c,d,a];
            let points = [];
            for (let i = 0; i < originalPoints.length-1; i++) {
                // create points (=steps) between start and end point of each line in polyline
                let samples = Math.round(polygonLength([originalPoints[i], originalPoints[i+1]]) / STEP);
                let linePoints = sampledLine(originalPoints[i], originalPoints[i+1], samples) // with steps
                points = points.concat(linePoints);
            }
            mainStore.rawPaths.push(points);
        }
        idPath++
    }

    // THIS FUNCTION SAMPLES PATH TO POLYGON
    function polygonSampledFromPath(path) {

        //create SVG element PATH
        var svgpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgpath.setAttribute('d', path);

        var points = [];
        var len  = svgpath.getTotalLength();
        var newStep = adjustStep(STEP, len);
        for (var i = 0; i <= len+1; i += newStep) {
            var p = svgpath.getPointAtLength(i);
            points.push([p.x, p.y]);
        }
        return points;
    }

    // CREATES POINTS INSIDE OF LINE (without this, gradients on lines, rectangles, polylines and polygons wouldn't work)
    function sampledLine(a,b,samples) {
        var stepX = (b[0] - a[0]) / samples;
        var stepY = (b[1] - a[1]) / samples;
        var points = [];
        for (var i = 0; i < samples+1; i ++) { // samples+1 -> because number of points = number of samples+1
            points.push([a[0]+stepX*i, a[1]+stepY*i]);
        }
        return points;
    }

    function polygonLength(points) {
        let len = 0;
        for (var i = 0; i < points.length-1; i++) {
            var a = points[i+1][0] - points[i][0];
            var b = points[i+1][1] - points[i][1];
            len += Math.sqrt( a*a + b*b );
        }
        return len;
    }

    // ADJUSTING STEP TO COVER COMPLETE LENGTH OF THE PATH
    function adjustStep(step, size) {
        let samples = Math.round(size / step);
        let newStep = size / samples;
        if (step === 0) { // step = 0 -> there is no movement
            return 0;
        } else {
            return newStep;
        }
    }

    // THIS FUNCTION CONVERTS CM TO PX IN 72 DPI
    function cmToPx(cm) {
        let px = (72 * cm) / 2.54
        return px;
    }

    // MAIN = LOADING SVG + PROCESSING
    onMounted(() => {

        mainStore.rawPaths = [];
        //settingsStore.pathSettings = [];
        mainStore.pathNames = [];

        // USE FABRIC.JS TO GET ALL SHAPES FROM SVG
        fabric.loadSVGFromURL(mainStore.svgLink, function(objects, options) {
            var image = fabric.util.groupSVGElements(objects, options);

            if (image.type == 'group'){
                image.forEachObject(function(obj) {
                    makePolygons(obj);
                });
            } else {
                makePolygons(image);
            }
        });

        // WRITING ALL POINTS INTO CONSOLE
            var text = "";
            for (let i = 0; i < mainStore.rawPaths.length; i++) {
                text += '[';
                for (let j = 0; j < mainStore.rawPaths[i].length; j++) {
                    let point = '[' + Math.round(mainStore.rawPaths[i][j][0]*10)/10 + ',' + Math.round(mainStore.rawPaths[i][j][1]*10)/10 + '],';
                    text += point;
                }
                text += '],'
            }
            console.log(mainStore.rawPaths);
            console.log(text);
    })
</script>


<style>
</style>