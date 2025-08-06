import { createSubscriber } from "svelte/reactivity";

const subscribe = createSubscriber((update) => {
  const interval = setInterval(() => {
    update();
  }, 1000);

  return () => clearInterval(interval);
});

export default {
  get now() {
    subscribe();
    return Date.now();
  },
};
