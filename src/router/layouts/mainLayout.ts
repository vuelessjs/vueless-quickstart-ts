export default {
  path: "/",
  name: "MainLayout",
  component: () => import("../../layouts/Main/index.vue"),
  children: [],
  meta: {
    title: "title.vueless",
    isMainLayout: true,
  },
};
