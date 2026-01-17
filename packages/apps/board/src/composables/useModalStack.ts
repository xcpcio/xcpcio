import { ref } from "vue";

const modalStack = ref<symbol[]>([]);

export function useModalStack() {
  const id = Symbol("modal");

  function register() {
    modalStack.value.push(id);
  }

  function unregister() {
    const index = modalStack.value.indexOf(id);
    if (index > -1) {
      modalStack.value.splice(index, 1);
    }
  }

  function isTopModal() {
    return modalStack.value[modalStack.value.length - 1] === id;
  }

  return { register, unregister, isTopModal };
}
