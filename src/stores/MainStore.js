import { defineStore } from 'pinia'

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

export const useMainStore = defineStore('MainStore', {
    state: () => {
        return {
            phase: 0,
            change: 0,
            reload: 0,

            svgLink: null,

            canvasSize: { x: 50, y: 40 },       // size of real canvas (cm)
            artboardSize: { x: 500, y: 400 },   // size of digital artboard (px)
            scaleView: 1,

            maxDrops: 1,

            drops: [],
            dropsColor: [],
            selectedDrops: [],

            pathNames: [],
            rawPaths: [],
            selectedPaths: []
        };
    }
    // actions
    // getter ...
})
