<script setup lang="ts">
const route = useRoute();

const id = route.path.split("/").pop() as string;
</script>

<template>
  <div>
    <Rating
      :id="id"
    />
  </div>
</template>
