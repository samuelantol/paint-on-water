<template>
    <div class="universal-group">
        <div>
            <div>
                <button @click="upload" :disabled="robotRunning">send to robot</button>
            </div>
            <div>
                <button @click="show">show in console</button>
            </div>
        </div>
    </div>
</template>


<script setup>
    import { useMainStore } from '../stores/MainStore'
    import { dot } from 'mathjs'
    import { ref, onMounted } from 'vue'

    const production = true;

    const mainStore = useMainStore()

    const robotRunning = ref(true);
    const API_URL = 'http://192.168.0.105:3000/api/status'
    const PRINT_URL = 'http://192.168.0.105:3000/api/print'

    let rescale = 0.3521/1000;
    // let approach = 0.1;
    // let postScaler = 1000;

    var interval; // interval for updating robot status

    // show data in console
    function show() {
        let file = createFile();
        console.log(file);
    }

    // send data to node server -> upload to robot
    function upload(){
        let file = createFile();
		console.log(file)
        uploadToServer(file);

        robotRunning.value = true;      // disable button
        clearInterval(interval);        // prevent button from enabling before robot starts printing
        var timeout = setTimeout(function() {
            interval = setInterval(getData, 1000);
        }, 2000);
    }

    async function uploadToServer(text) {
        // (A) CREATE BLOB OBJECT
        var myBlob = new Blob([text], {type: "text/plain"});

        // (B) FORM DATA
        var data = new FormData();
        data.append("export", myBlob);

        // (C) AJAX UPLOAD TO SERVER
        if (production) {
			fetch(PRINT_URL, {
			method: "POST",
			body: text
			})
			.then((res) => { return res.text(); })
			.then((txt) => { console.log(txt); });
        }
    }

    // get gata from node server
    onMounted(() => {
		console.log('mounted!')
        interval = setInterval(getData, 1000);
    });

    function getData() {
        if (production) {
			fetch(API_URL)
				.then(response => response.json())
				.then(result => {
					robotRunning.value = result;
					console.log(result);
				})
        }
    }

    //
    //
    // THIS creates multiline string with text instructions for robot
    function createFile() {
        var lines = "";

        // 1. EDIT LOCATIONS
        let locHome = {x: 0, y: 0};
        let locClean = {x: 0, y: 0}; // cleaning tank
        let locRed = {x: 10, y: 10};
        let locGreen = {x: 11, y: 11};
        let locBlue = {x: 12, y: 12};
        let locWhite = {x: 13, y: 13};
        let locBlack = {x: 14, y: 14};
        let locColors = [locRed, locGreen, locBlue, locWhite, locBlack];


        // 2. DEFINE VARIABLES
        lines += ("def Print():\n");
        lines += ("  #set parameters\n");
        lines += ("  global distance_down_m = 0\n");
        lines += ("  global distance_up_m = 0.1\n");
        lines += ("  global rapid_ms = 0.25\n"); //
        lines += ("  global speed_ms = 0.05\n");
        lines += ("  global accel_ms = 0.3\n");
        lines += ("  global blend_radius_m = 0.001\n");     // radius
        lines += ("  global feature = Spray\n");       // plane

        //RUN
        // move home and sleep
        lines += ("  movel(pose_trans(feature, p[0,0,distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
        lines += ("  sleep(2)\n");

        // loop through colors
        for (let i = 0; i < locColors.length; i++) {
            var counter = 0;

            // loop through drops
            for (let j = 0; j < mainStore.drops.length; j++) {

                if (mainStore.dropsColor[j].colorCode === i) {
                    let x = mainStore.drops[j][0] * rescale;
                    let y = mainStore.drops[j][1] * rescale;

                    if (counter % mainStore.maxDrops === 0) {

                        // move up to color
                        lines += ("  movel(pose_trans(feature, p["+locColors[i].x+","+locColors[i].y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                        // move down
                        lines += ("  movel(pose_trans(feature, p["+locColors[i].x+","+locColors[i].y+",distance_down_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                        // move up
                        lines += ("  movel(pose_trans(feature, p["+locColors[i].x+","+locColors[i].y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                    }

                    // move up to drop
                    lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                    // move down
                    lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_down_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                    // move up
                    lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");

                    counter++;
                }
            }

            // clean tool, if the color is used
            if (counter != 0) {
                // move up to cleaning tank
                lines += ("  movel(pose_trans(feature, p["+locClean.x+","+locClean.y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                // move down
                lines += ("  movel(pose_trans(feature, p["+locClean.x+","+locClean.y+",distance_down_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                // move up
                lines += ("  movel(pose_trans(feature, p["+locClean.x+","+locClean.y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
            }
        }

        // move home and sleep
        lines += ("  movel(pose_trans(feature, p[0,0,distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
        lines += ("  sleep(2)\n");

        // loop through paths
        for (let i = 0; i < mainStore.rawPaths.length; i++) {

            if (mainStore.rawPaths[i] != null) {

                // 1ST POINT
                let x = mainStore.rawPaths[i][0][0] * rescale;
                let y = mainStore.rawPaths[i][0][1] * rescale;

                // move up to the first position
                lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
                // lines += ("  sleep(0.3)\n");
                // move down
                lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_down_m,0,0,0]),accel_ms, rapid_ms, 0, 0)\n");

                // try 2ND POINT
                if (mainStore.rawPaths[i][1] != null) {
                    x = mainStore.rawPaths[i][1][0] * rescale;
                    y = mainStore.rawPaths[i][1][1] * rescale;

                    lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_down_m,0,0,0]),accel_ms, speed_ms, 0, blend_radius_m)\n");
                }

                // loop through points – 3RD TO 2ND LAST POINT
                for (let j = 2; j < mainStore.rawPaths[i].length-1; j++) {
                    x = mainStore.rawPaths[i][j][0] * rescale;
                    y = mainStore.rawPaths[i][j][1] * rescale;

                    if (j > 1 && j < mainStore.rawPaths[i].length) {
                        var angle = checkForSharpAngle(mainStore.rawPaths[i][j-1], mainStore.rawPaths[i][j], mainStore.rawPaths[i][j+1]);

                        //checking sharp angles (previously used by moveP, not necessary -- just ELSE should be enough)
                        if (false && angle > 2.9 || angle < -2.9) {
                            lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_down_m,0,0,0]), accel_ms, rapid_ms, 0, blend_radius_m)\n");
                            
                            // move up
                            lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, blend_radius_m)\n");
                            // move down
                            lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_down_m,0,0,0]),accel_ms, rapid_ms, 0, 0)\n");

                            let x2 = mainStore.rawPaths[i][j+1][0] * rescale;
                            let y2 = mainStore.rawPaths[i][j+1][1] * rescale;

                            lines += ("  movel(pose_trans(feature, p["+x2+","+y2+",distance_down_m,0,0,0]), accel_ms, rapid_ms, 0, blend_radius_m)\n");
                        } else {
                            lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_down_m,0,0,0]), accel_ms, speed_ms, 0, blend_radius_m)\n");
                        }
                    }
                }

                // LAST POINT
                x = mainStore.rawPaths[i][mainStore.rawPaths[i].length-1][0] * rescale;
                y = mainStore.rawPaths[i][mainStore.rawPaths[i].length-1][1] * rescale;

                lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_down_m,0,0,0]), accel_ms, speed_ms, 0, 0)\n");
                // move up
                lines += ("  movel(pose_trans(feature, p["+x+","+y+",distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, blend_radius_m)\n");
            }
        }

        // go above origin at the end of the file
        lines += ("  movel(pose_trans(feature, p[0,0,distance_up_m,0,0,0]), accel_ms, rapid_ms, 0, 0)\n");
        lines += ("end\n");
        lines += ("Print()");

        return lines;
    }

    function checkForSharpAngle(a,b,c) {
        let v1 = [ b[0]-a[0], b[1]-a[1] ];
        let v2 = [ c[0]-b[0], c[1]-b[1] ];
        let n1 = normalize(v1);
        let n2 = normalize(v2);
        let angle = Math.acos(dot(n1,n2));
        return angle;
    }

    function normalize(vector) {
        let mag = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
        let normalized = [vector[0]/mag, vector[1]/mag];
        return normalized;
    }

</script>


<style>
</style>
