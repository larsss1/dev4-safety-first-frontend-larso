<template>
	<div class="parking-page">
		<header class="row">
			<h1>Parking #{{ parking?.id }} — {{ parking?.name || "Loading…" }}</h1>
			<router-link to="/parkings">← Back to list</router-link>
		</header>

		<section v-if="parking" class="card">
			<p><strong>Location:</strong> {{ parking.location }}</p>
			<p><strong>Capacity:</strong> {{ parking.capacity }}</p>
			<p><strong>Open spots:</strong> {{ openSpots }}</p>
			<p><strong>24/7:</strong> {{ parking.access247 ? "Yes" : "No" }}</p>
			<p>
				<strong>Type:</strong>
				{{ parking.coveredOrOpenAir ? "Covered" : "Open Air" }}
			</p>
			<p><strong>Safety:</strong> {{ parking.safetyMeasures || "N/A" }}</p>
			<p><strong>Price/hour:</strong> {{ parking.pricePerHour ?? "N/A" }}</p>
		</section>

		<section class="card">
			<h2>Check-in Bike in this Parking</h2>
			<form @submit.prevent="handleCheckIn">
				<input v-model="newOwnerName" placeholder="Owner name" required />
				<button :disabled="checkingIn" type="submit">
					{{ checkingIn ? "Checking in…" : "Check in)" }}
				</button>
			</form>
			<p v-if="checkInError" class="error">{{ checkInError }}</p>
			
		</section>

		<section class="card">
			<h2>Currently Parked ({{ currentBikes.length }})</h2>
			<p v-if="loadingBikes">Loading bikes…</p>
			<p v-else-if="currentBikes.length === 0">No bikes currently parked.</p>
			<ul v-else>
				<li v-for="b in currentBikes" :key="b.id" class="row">
					<div>
						<strong>#{{ b.id }}</strong> — {{ b.ownerName }}<br />
						Entry: {{ formatReadable(b.entryTime) }}
					</div>
					<button
						@click="handleCheckout(b.id)"
						:disabled="checkingOutId === b.id"
					>
						{{ checkingOutId === b.id ? "Checking out…" : "Check-out" }}
					</button>
				</li>
			</ul>
		</section>

		<section class="card">
			<h2>History</h2>
			<p v-if="loadingBikes">Loading…</p>
			<p v-else-if="historyBikes.length === 0">No history yet.</p>
			<ul v-else>
				<li v-for="b in historyBikes" :key="'h-' + b.id">
					<strong>#{{ b.id }}</strong> — {{ b.ownerName }}<br />
					Entry: {{ formatReadable(b.entryTime) }}<br />
					Exit: {{ formatReadable(b.departureTime) }}
				</li>
			</ul>
		</section>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

const route = useRoute();
const parkingId = computed(() => Number(route.params.id));

/** Zet dit gelijk met je backend-poort */
const api = axios.create({
	baseURL: "http://localhost:9000/api",
	headers: { Accept: "application/json" },
});

const parking = ref(null);
const bikes = ref([]);
const loadingParking = ref(false);
const loadingBikes = ref(false);

const newOwnerName = ref("");
const checkingIn = ref(false);
const checkInError = ref("");
const checkingOutId = ref(null);

/* ------------ helpers ------------ */
const logAxiosError = (msg, e) => {
	if (e?.response) {
		console.error(msg, {
			status: e.response.status,
			data: e.response.data,
			url: e.config?.url,
			method: e.config?.method,
		});
	} else if (e?.request) {
		console.error(msg, "No response", e.message);
	} else {
		console.error(msg, e?.message || e);
	}
};

const nowLocalDateTime = () => {
	// "YYYY-MM-DDTHH:mm:ss"
	const pad = (n) => String(n).padStart(2, "0");
	const d = new Date();
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
		d.getHours()
	)}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const formatReadable = (v) => {
	if (!v) return "";
	const d = new Date(v);
	return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

/* ------------ API calls ------------ */
const getParking = (id) => api.get(`/parkings/${id}`);
const getBikes = () => api.get("/bikes");
const createBike = (payload) =>
	api.post("/bikes", payload, {
		headers: { "Content-Type": "application/json" },
	});
const removeBike = (id) => api.put(`/bikes/${id}/remove`);

/* ------------ computed per parking ------------ */
const currentBikes = computed(() =>
	bikes.value.filter(
		(b) =>
			(b.parkingId ?? b.parking?.id) === parkingId.value && !b.departureTime
	)
);

const historyBikes = computed(() =>
	bikes.value
		.filter(
			(b) =>
				(b.parkingId ?? b.parking?.id) === parkingId.value && !!b.departureTime
		)
		.sort((a, z) => new Date(z.entryTime) - new Date(a.entryTime))
);

const openSpots = computed(() => {
	if (!parking.value) return "-";
	return Math.max(0, parking.value.capacity - currentBikes.value.length);
});

/* ------------ data flow ------------ */
const fetchParking = async () => {
	loadingParking.value = true;
	try {
		const res = await getParking(parkingId.value);
		parking.value = res.data;
	} catch (e) {
		logAxiosError("Failed to fetch parking", e);
	} finally {
		loadingParking.value = false;
	}
};

const fetchBikes = async () => {
	loadingBikes.value = true;
	try {
		const res = await getBikes();
		const items = Array.isArray(res.data) ? res.data : [];
		bikes.value = items.map((b, idx) => ({
			id: b.id ?? idx,
			ownerName: b.ownerName ?? "",
			entryTime: b.entryTime ?? "",
			departureTime: b.departureTime ?? "",
			parkingId: b.parkingId ?? b.parking?.id ?? null,
			parking: b.parking,
		}));
	} catch (e) {
		logAxiosError("Failed to fetch bikes", e);
	} finally {
		loadingBikes.value = false;
	}
};

/* ------------ actions ------------ */
const handleCheckIn = async () => {
	if (!parking.value) return;
	checkInError.value = "";
	checkingIn.value = true;
	try {
		const payload = {
			ownerName: newOwnerName.value.trim(),
			parkingId: parking.value.id,
			entryTime: nowLocalDateTime(),
			departureTime: null,
		};
		const res = await createBike(payload);
		if (res.status >= 200 && res.status < 300) {
			newOwnerName.value = "";
			await fetchBikes();
		}
	} catch (e) {
		checkInError.value =
			e?.response?.data?.error ||
			"Could not check-in (parking full or not found).";
		logAxiosError("Failed to check-in", e);
	} finally {
		checkingIn.value = false;
	}
};

const handleCheckout = async (bikeId) => {
	checkingOutId.value = bikeId;
	try {
		await removeBike(bikeId); // backend zet departureTime = now
		await fetchBikes();
	} catch (e) {
		logAxiosError("Failed to check-out", e);
		alert("Failed to check-out this bike.");
	} finally {
		checkingOutId.value = null;
	}
};

/* ------------ lifecycle ------------ */
onMounted(async () => {
	await fetchParking();
	await fetchBikes();
});

watch(parkingId, async () => {
	await fetchParking();
	await fetchBikes();
});
</script>

<style scoped>
.parking-page {
	max-width: 900px;
	margin: auto;
	padding: 1rem;
}
.row {
	display: flex;
	gap: 10px;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
}
.card {
	border: 1px solid #e7e7e7;
	border-radius: 10px;
	padding: 12px;
	margin-bottom: 12px;
}
.error {
	color: #b00020;
}
button {
	padding: 0.5rem 0.8rem;
}
input {
	padding: 0.5rem;
}
</style>
