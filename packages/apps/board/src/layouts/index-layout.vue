<template>
  <NavBar
    width="sm:w-[1024px] lg:w-screen"
  />
  <main
    class="lg:mt-[-52px]"
    py-2
    text-gray-700 dark:text-gray-200
  >
    <RouterView />
    <Footer />
  </main>
</template>
