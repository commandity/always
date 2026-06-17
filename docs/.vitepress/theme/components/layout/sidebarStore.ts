import { ref, watch } from "vue";

export const showSidebar = ref(true);
export const suppressTransition = ref(false);
let userPref = true;

if (typeof window !== "undefined") {
  const mql = window.matchMedia("(max-width: 959px)");
  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    if (!e.matches) {
      suppressTransition.value = true;
      showSidebar.value = userPref;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          suppressTransition.value = false;
        });
      });
    } else {
      showSidebar.value = true;
    }
  };
  handler(mql);
  mql.addEventListener("change", handler as (e: Event) => void);
}

watch(showSidebar, (val) => {
  if (
    typeof window !== "undefined" &&
    !window.matchMedia("(max-width: 959px)").matches
  ) {
    userPref = val;
  }
});
