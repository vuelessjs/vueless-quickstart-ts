export default {
  path: "/",
  name: "MainLayout",
  redirect: { name: "WelcomePage" },
  component: () => import("@/layouts/Main/index.vue"),
  children: [],
};
