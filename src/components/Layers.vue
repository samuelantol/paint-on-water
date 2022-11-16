<template>
    <div v-if="!loaded">
        <div class="universal-group">
            <h1>File</h1>
            <label class="file-reader">
                upload svg
                <input type="file" @change="loadFile" />
            </label>
        </div>
    </div>

    <div v-else>
        <div class="universal-group">
            <h1>File — {{file.name}}</h1>
            <!-- <div v-if="!active">
                <button @click="toggle">↓ {{file.name}}</button>
            </div>
            <div v-else>
                <button @click="toggle">↑ {{file.name}}</button>
                <div v-for="drop in mainStore.dropsColor" :key="drop.id">
                    <button class="button-paths" :class="{ selected: isSelected(drop.id) }" @click="selectDrop(drop.id)">{{drop.color}}</button>
                </div>
                <div v-for="path in mainStore.pathNames" :key="path.id">
                    <button class="button-paths" :class="{ selected: isSelected(path.id) }" @click="select(path.id)">{{path.type}}</button>
                </div>
            </div> -->
            <label class="file-reader">
                replace svg
                <input type="file" @change="reload" />
            </label>  
        </div>
    </div>
</template>


<script setup>
    import { ref } from 'vue'
    import { useMainStore } from '../stores/MainStore'

    const mainStore = useMainStore();

    const loaded = ref(false);
    const active = ref(false);
    const file = ref(null);

    let idLayer = 0;
    const layers = ref([ // more imported SVGs – it's implemented in <template> – but not used yet
        {id: idLayer++, text: 'layer.svg', paths: mainStore.paths}
    ])

    function toggle() {
        active.value = !active.value
    }

    function loadFile(ev) {
        file.value = ev.target.files[0];
        const reader = new FileReader();

        if (file.value.name.includes(".svg")) {
            reader.readAsText(file.value);

            mainStore.svgLink = URL.createObjectURL(file.value);        //save URL to store
            mainStore.phase = 2;

            loaded.value = true;
        }
    }

    function reload(ev) {
        mainStore.rawPaths = [];
        mainStore.pathNames = [];
        mainStore.drops = [];
        mainStore.dropsColor = [];
        mainStore.svgLink = null;

        loadFile(ev);

        mainStore.reload ++;
        mainStore.change ++;
    }

    function isSelected(id) {
        var already = false;
        for (let i = 0; i < mainStore.selectedPaths.length; i++) {
            if (mainStore.selectedPaths[i] === id) {
                already = true;
            }
        }
        return already;
    }

    function select(id) {
        var already = isSelected(id);

        // only select one at a time
        if (mainStore.selectedPaths[0] === id) {
            mainStore.selectedPaths = [];
        } else {
            mainStore.selectedPaths = [];
            mainStore.selectedPaths.push(id);
            
            // update inputs
            // settingsStore.speedStart = settingsStore.pathSettings[id].speedStart;
            // settingsStore.speedEnd = settingsStore.pathSettings[id].speedEnd;
        }

        mainStore.change++;
    }

    function isSelectedDrop(id) {
        var already = false;
        for (let i = 0; i < mainStore.selectedPaths.length; i++) {
            if (mainStore.selectedPaths[i] === id) {
                already = true;
            }
        }
        return already;
    }

    function selectDrop(id) {
        var already = isSelectedDrop(id);

        // only select one at a time
        if (mainStore.selectedDrops[0] === id) {
            mainStore.selectedDrops = [];
        } else {
            mainStore.selectedDrops = [];
            mainStore.selectedDrops.push(id);
            
            // update inputs
            // settingsStore.speedStart = settingsStore.pathSettings[id].speedStart;
            // settingsStore.speedEnd = settingsStore.pathSettings[id].speedEnd;
        }

        mainStore.change++;
    }

    function deselect() {
        mainStore.selectedPaths = [];
        mainStore.change++;
    }

    // DESELECT BY CLICKING ANYWHERE, not working very well yet

    // onBeforeUnmount(() => {
    //   document.removeEventListener('mousedown', deselect);
    // })

    // onMounted(() => {
    //   document.addEventListener('mousedown', deselect);
    // })
</script>


<style>
    /* .file-reader {
        font-family: Uncut;
        font-size: 24px;
        padding: 4px 20px 4px 20px;
        text-align: left;
        margin: 5px auto auto 0px;
	    cursor: pointer;
	    outline: inherit;
        color: rgba(0, 50, 250, 1);
        
        border: 2px solid rgba(0, 50, 250, 1);  
        border-radius: 16px;
        background: none;
    } */
    .file-reader {
        font-family: Uncut;
        font-size: 24px;
        padding: 4px 20px 4px 20px;
        margin: 5px auto 5px 0px;
	    cursor: pointer;
	    outline: inherit;
        color: white;
        
        border: 2px solid rgba(0, 50, 250, 1);  
        border-radius: 16px;
        background: rgba(0, 50, 250, 1);
    }
    .file-reader:hover {
        box-shadow: 0 0 10px rgba(0, 50, 250, 1);
    }
    .file-reader input {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        opacity: 0;
    }
</style>