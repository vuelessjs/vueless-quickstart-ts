export default [
  {
    path: "",
    name: "WelcomePage",
    component: () => import("./views/Page.vue"),
    meta: {
      isMainLayout: true,
    },
  },
];
