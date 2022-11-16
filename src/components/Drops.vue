<template>
    <div class="universal-group">
        <!-- TITLE AND TOGGLE -->
        <h1>Maximum number of drops from one color</h1>
        <!-- SINGLE SPEED -->
        <div class="small-group">
            <button class="minus" @click.stop="minus">−</button>
            <div class="input" :class="{ focus: focusElement === 1 }">
                <input :size="inputWidth" @mousedown.stop @keyup="changeValue" @focus="focusElement = 1" @blur="focusElement = 0" v-model="mainStore.maxDrops">
                <!-- <span class="unit">drops</span> -->
            </div>
            <button class="plus" @click.stop="plus">+</button>
        </div>
    </div>
</template>


<script setup>
    import { ref } from 'vue'
    import { useMainStore } from '../stores/MainStore'

    const mainStore = useMainStore();

    const focusElement = ref(0);

    const inputWidth = ref(1);

    function minus(loc) {
        mainStore.maxDrops--;

        mainStore.change++;
    }

    function plus(loc) {
        mainStore.maxDrops++;

        mainStore.change++;
    }
</script>


<style>
</style>