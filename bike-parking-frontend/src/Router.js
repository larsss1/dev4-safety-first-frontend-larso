import { createRouter, createWebHistory } from "vue-router";
import Parkings from "../src/components/Parkings.vue";
import ParkingPage from "../src/components/ParkingPage.vue";
import Bikes from "./components/Bikes.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: "/", redirect: "/parkings" },
		{ path: "/parkings", component: Parkings },
		{ path: "/parkings/:id", component: ParkingPage, props: true },
		{ path: "/bikes", component: Bikes },
		{ path: "/bikes/:id", component: Bikes, props: true },
	],
});

export default router;
