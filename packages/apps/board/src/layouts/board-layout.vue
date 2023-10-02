<template>
  <NavBar
    width="sm:w-[1280px] xl:w-screen"
  />
  <main
    py-2
    text-gray-700 dark:text-gray-200
  >
    <RouterView />
    <Footer
      class="sm:w-[1280px] xl:w-screen"
    />
  </main>
</template>
