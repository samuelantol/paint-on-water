<template>
    <div>
        <div class="layers">
            <div class="universal-group">
                <h1>{{title}}</h1>
            </div>
            <div class="layersGroup">
                <Layers />
            </div>
            <div class="layersGroup">
                <Drops />
            </div>        
            <div class="layersGroup">
                <Export />
            </div>
        </div>
        <div class="layers">
            <Artboard />
        </div>
     </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useMainStore } from './stores/MainStore';
    import Export from './components/ExportUR.vue';
    import Layers from './components/Layers.vue';
    import Drops from './components/Drops.vue'
    import Artboard from './components/Artboard.vue'

    const store = useMainStore()

    const title = ref("Paint on water")
</script>

<style>
    body {
        background-color: rgb(250, 250, 250, 1);
        margin: 0;
    }

    @font-face {
        font-family: 'Uncut';
        src: url('./assets/fonts/Uncut-Sans-Regular.woff');
        padding: 0;
    }

    h1 {
        font-family: Uncut;
        font-size: 24px;
        font-weight: normal;
        text-align: left;
        line-height: 0.9;
        color: rgba(0, 50, 250, 1);
        padding: 0;
        margin: 10px 0px 12px 0px;
        left: 0;
    }

    /* GROUPS OF ELEMENTS */
    .button-group {
        width: 100%;
        display: flex;
        align-items: center;
        margin-top: 40px;
    }
    .top-menu {
        width: 100%;
        display: flex;
        align-items: center;
        margin-bottom: 8px;

    }
    .universal-group {
        display: flex;
        flex-direction: column;
        width: 270px;
        background: none;
        border: 2px solid rgba(0, 50, 250, 1);
        padding: 16px 16px 12px 16px;
        margin-bottom: 8px;
        border-radius: 16px;
    }
    .small-group {
        display: flex;
        flex-direction: row;
        text-align: right;
        margin: 5px auto 5px 0px;
    }
    .layers {
        /* position: absolute; */
        float: left;
        text-align: left;
        margin-top: 32px;
        margin-left: 32px;
        max-height: 96vh;
        overflow: auto;
        -ms-overflow-style: none;  /* hide scrollbar IE and Edge */
        scrollbar-width: none;  /* hide scrollbar Firefox */
    }
    .layers::-webkit-scrollbar {
        display: none;
    }
    .layersGroup {
        margin-bottom: 32px;
    }

    /* ELEMENTS */
    input {
        font-family: Uncut;
        color: rgba(0, 50, 250, 1);
        font-size: 24px;
        text-align: right;
        width: 60px;
        background: none;
        border: none;
        margin: 0px;
        padding: 0px;
    }
    input:focus {
        outline: none;
    }
    input:hover {
        outline: none;
    }
    .input {
        font-family: Uncut;
        font-size: 24px;

        border: 2px solid rgba(0, 50, 250, 1);  
        border-radius: 16px;
        background: none;

        padding: 4px 4px 4px 12px;
        margin: 5px auto auto 0px;
    }
    .input:hover {
        outline: none;
        box-shadow: 0 0 10px rgba(0, 50, 250, 1);
    }

    button {
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
    button:hover {
        box-shadow: 0 0 10px rgba(0, 50, 250, 1);
    }
    .plus{
        padding: 2px 10px 6px 10px;
        margin-left: 12px;
        margin-bottom: 0px;
    }
    .minus{
        padding: 2px 10px 6px 10px;
        margin-right: 12px;
        margin-bottom: 0px;
    }
    .return {
        background: none;
        color: white;
        border: none;
        margin-left: 0px;
    }
    .component-import{
        margin: auto auto;
    }

    /* DISABLED STATE */

    :disabled {
        font-family: Uncut;
        font-size: 24px;
        font-variation-settings: 'wdth' 500, 'wght' 1000;
        pointer-events: none;
        opacity: 20%;
    }
</style>