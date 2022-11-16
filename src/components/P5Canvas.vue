<template>
    <div  id="p5Canvas"></div>
</template>
  
  
<script setup>
    import p5 from "p5";
    import { useMainStore } from '../stores/MainStore'
    import { onMounted } from 'vue'

    const mainStore = useMainStore()

    let lineWidth = 20 * mainStore.scaleView;
    var dropSize = 50 * mainStore.scaleView;
    var change = mainStore.change;

    onMounted(() => {
        const script = function (p5) {   
            
            // SET UP 
            p5.setup = _ => {      
                var canvas = p5.createCanvas(mainStore.artboardSize.x, mainStore.artboardSize.y);
                canvas.parent("p5Canvas");

                p5.background(255);

                showPaths();
            }     

            // DRAW
            p5.draw = _ => { 
                if (change != mainStore.change) {
                    change = mainStore.change;
                
                    //pattern = settingsStore.needlePatternP5[settingsStore.layerSettings.needlePattern].pattern;
                    //width = cmToPx( settingsStore.needlePatternP5[settingsStore.layerSettings.needlePattern].width) * mainStore.scaleView;
                    
                    p5.blendMode(p5.BLEND);
                    p5.background(255);
                    
                    showPaths();
                }
            }

            function showPaths() {
                //DRAW DROPS
                for (let i = 0; i < mainStore.drops.length; i++) {
                    var x = mainStore.drops[i][0] * mainStore.scaleView;
                    var y = mainStore.drops[i][1] * mainStore.scaleView;
                    var color = mainStore.dropsColor[i].color;

                    p5.blendMode(p5.DARKEST);
                    p5.fill(color);
                    p5.noStroke();
                    p5.ellipse(x, y, dropSize, dropSize);
                }
                // DRAW PATHS
                for (let i = 0; i < mainStore.rawPaths.length; i++) {
                    var color = parseInt(150);

                    for (let j = 0; j < mainStore.rawPaths[i].length; j++) {
                        let x  = mainStore.rawPaths[i][j][0] * mainStore.scaleView;
                        let y  = mainStore.rawPaths[i][j][1] * mainStore.scaleView;

                        p5.blendMode(p5.DARKEST);
                        p5.fill(color);
                        p5.noStroke();
                        p5.ellipse(x, y, lineWidth, lineWidth);
                    }
                }
                // DRAW SELECTION of PATHS
                for (let i = 0; i < mainStore.selectedPaths.length; i++) {
                    for (let j = 0; j < mainStore.rawPaths[ mainStore.selectedPaths[i] ].length; j++) {
                        let x  = mainStore.rawPaths[mainStore.selectedPaths[i]][j][0] * mainStore.scaleView;
                        let y  = mainStore.rawPaths[mainStore.selectedPaths[i]][j][1] * mainStore.scaleView;
                        
                        p5.blendMode(p5.BLEND);
                        p5.fill(255, 0, 0);
                        p5.noStroke();
                        p5.ellipse(x, y, 3, 3);
                    }
                    // draw starting point
                    let x  = mainStore.rawPaths[mainStore.selectedPaths[i]][0][0] * mainStore.scaleView;
                    let y  = mainStore.rawPaths[mainStore.selectedPaths[i]][0][1] * mainStore.scaleView;

                    let color = parseInt(0);
                    p5.blendMode(p5.BLEND);
                    p5.stroke(255, 0, 0);
                    p5.strokeWeight(3)
                    p5.fill(color*5);
                    p5.ellipse(x, y, 7.5, 7.5);
                }
                // DRAW SELECTION of DROPS
                for (let i = 0; i < mainStore.selectedDrops.length; i++) {
                    var x = mainStore.drops[mainStore.selectedDrops[i]][0] * mainStore.scaleView;
                    var y = mainStore.drops[mainStore.selectedDrops[i]][1] * mainStore.scaleView;
                    var size = 50;

                    p5.blendMode(p5.DARKEST);
                    p5.noFill();
                    p5.stroke(0);
                    p5.strokeWeight(3);
                    p5.ellipse(x, y, size, size);
                }
            }
        }
        new p5(script);
    })

    function cmToPx(cm) {
        let px = (72 * cm) / 2.54
        return px;
    }
</script>

<style>
    #p5Canvas {
        display: block;
        margin: 0 auto;
        padding: 0;
        overflow: hidden;
        border-radius: 16px;
    }
    canvas {
        border-radius: 16px;
    }
</style>
  