import { createRouter, createWebHistory } from "vue-router";
import Parkings from "../src/components/Parkings.vue";
import ParkingPage from "../src/components/ParkingPage.vue";
import ParkingHystory from "../src/components/ParkingHistory.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: "/", redirect: "/parkings" },
		{ path: "/parkings", component: Parkings },
		{ path: "/parkings/:id", component: ParkingPage, props: true },
		{ path: "/history", component: ParkingHystory },
	],
});

export default router;
