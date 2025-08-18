<template>
	<div class="parkings-page">
		<h1>Bike Parkings</h1>

		<!-- Create Parking Form -->
		<form @submit.prevent="handleCreate">
			<h2>Add New Parking</h2>
			<input v-model="newParking.name" placeholder="Name" required />
			<input v-model="newParking.location" placeholder="Location" required />
			<input
				v-model.number="newParking.capacity"
				placeholder="Capacity"
				type="number"
				required
			/>
			<input
				v-model="newParking.safetyMeasures"
				placeholder="Safety Measures"
			/>

			<label class="checkbox">
				<input v-model="newParking.access247" type="checkbox" />
				24/7 Access
			</label>

			<input
				v-model.number="newParking.pricePerHour"
				placeholder="Price Per Hour"
				type="number"
			/>

			<select v-model="newParking.coveredOrOpenAir" required>
				<option :value="true">Covered</option>
				<option :value="false">Open Air</option>
			</select>

			<button type="submit">Add Parking</button>
		</form>

		<hr />

		<!-- Parkings List -->
		<h2>All Parkings</h2>
		<p v-if="loading">Loading…</p>
		<p v-else-if="parkings.length === 0">No parkings found.</p>

		<ul v-else>
			<li v-for="(parking, i) in parkings" :key="parking.id ?? i">
				<div v-if="editId !== (parking.id ?? i)">
					<strong>{{ parking.name }}</strong> — {{ parking.location }}<br />
					id : {{ parking.id }}<br />
					Capacity: {{ parking.capacity }}<br />
					Safety: {{ parking.safetyMeasures || "N/A" }}<br />
					24/7: {{ parking.access247 ? "Yes" : "No" }}<br />
					Price/hour: {{ parking.pricePerHour ?? "N/A" }}<br />
					Type: {{ parking.coveredOrOpenAir ? "Covered" : "Open Air" }}<br />
					<button @click="startEdit(parking, i)">Edit</button>
					<button @click="handleDelete(parking.id ?? i)">Delete</button>
					<button @click="$router.push(`/parkings/${parking.id}`)">Open</button>
				</div>

				<div v-else>
					<input v-model="editParking.name" required />
					<input v-model="editParking.location" required />
					<input v-model.number="editParking.capacity" type="number" required />
					<input v-model="editParking.safetyMeasures" />

					<label class="checkbox">
						<input v-model="editParking.access247" type="checkbox" />
						24/7 Access
					</label>

					<input v-model.number="editParking.pricePerHour" type="number" />

					<!-- IMPORTANT: booleans here too -->
					<select v-model="editParking.coveredOrOpenAir" required>
						<option :value="true">Covered</option>
						<option :value="false">Open Air</option>
					</select>

					<button @click="handleUpdate(currentEditId)">Save</button>
					<button @click="cancelEdit">Cancel</button>
				</div>
			</li>
		</ul>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

/** Adjust baseURL to your API root */
const api = axios.create({
	baseURL: "http://localhost:9000/api",
	headers: { Accept: "application/json" },
});

/* ---------- helpers ---------- */
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

// keep JSON clean; numbers are numbers, booleans are booleans
const sanitize = (p) => ({
	name: p.name?.trim() || "",
	location: p.location?.trim() || "",
	capacity:
		p.capacity === null || p.capacity === "" || Number.isNaN(Number(p.capacity))
			? undefined
			: Number(p.capacity),
	safetyMeasures: p.safetyMeasures?.trim() || "",
	access247: !!p.access247,
	pricePerHour:
		p.pricePerHour === null ||
		p.pricePerHour === "" ||
		Number.isNaN(Number(p.pricePerHour))
			? undefined
			: Number(p.pricePerHour),
	// CRUCIAL: boolean expected by Spring
	coveredOrOpenAir: !!p.coveredOrOpenAir,
});

/* ---------- API (JSON) ---------- */
const getParkings = () => api.get("/parkings");

const createParking = (payload) =>
	api.post("/parkings", sanitize(payload), {
		headers: { "Content-Type": "application/json" },
	});

const updateParking = (id, payload) =>
	api.put(`/parkings/${id}`, sanitize(payload), {
		headers: { "Content-Type": "application/json" },
	});

const deleteParking = (id) => api.delete(`/parkings/${id}`);

/* ---------- state ---------- */
const loading = ref(false);
const parkings = ref([]);

const newParking = ref({
	name: "",
	location: "",
	capacity: null,
	safetyMeasures: "",
	access247: false,
	pricePerHour: null,
	// IMPORTANT: default to a boolean
	coveredOrOpenAir: true, // true = Covered, false = Open Air
});

const editId = ref(null);
const editParking = ref({
	name: "",
	location: "",
	capacity: null,
	safetyMeasures: "",
	access247: false,
	pricePerHour: null,
	coveredOrOpenAir: true,
});

const currentEditId = computed(() => editId.value);

/* ---------- data flow ---------- */
const fetchParkings = async () => {
	loading.value = true;
	try {
		const res = await getParkings();
		console.log("[GET /parkings] status:", res.status);
		console.log("[GET /parkings] data:", res.data);

		// Expecting a plain array from Spring controller.
		const items = Array.isArray(res.data) ? res.data : [];
		// Ensure each item has an id (fallbacks if your field is named differently)
		// Ensure coveredOrOpenAir is boolean (backend sends true/false)
		parkings.value = items.map((p) => ({
			...p,
			id: p.id ?? p.parkingID ?? p.ID ?? p.uuid ?? p.uid,
			coveredOrOpenAir:
				typeof p.coveredOrOpenAir === "boolean"
					? p.coveredOrOpenAir
					: p.coveredOrOpenAir === "true"
					? true
					: p.coveredOrOpenAir === "false"
					? false
					: !!p.coveredOrOpenAir, // last resort
		}));
	} catch (e) {
		logAxiosError("Failed to fetch parkings", e);
	} finally {
		loading.value = false;
	}
};

/* ---------- create ---------- */
const handleCreate = async () => {
	try {
		await createParking(newParking.value);
		newParking.value = {
			name: "",
			location: "",
			capacity: null,
			safetyMeasures: "",
			access247: false,
			pricePerHour: null,
			coveredOrOpenAir: true,
		};
		await fetchParkings();
	} catch (e) {
		logAxiosError("Failed to create parking", e);
	}
};

/* ---------- edit ---------- */
const startEdit = (parking, index) => {
	editId.value = parking.id ?? index;
	editParking.value = {
		name: parking.name ?? "",
		location: parking.location ?? "",
		capacity: parking.capacity ?? null,
		safetyMeasures: parking.safetyMeasures ?? "",
		access247: !!parking.access247,
		pricePerHour: parking.pricePerHour ?? null,
		// make sure it's a boolean in the UI
		coveredOrOpenAir: !!parking.coveredOrOpenAir,
	};
};

const cancelEdit = () => {
	editId.value = null;
	editParking.value = {
		name: "",
		location: "",
		capacity: null,
		safetyMeasures: "",
		access247: false,
		pricePerHour: null,
		coveredOrOpenAir: true,
	};
};

/* ---------- update ---------- */
const handleUpdate = async (id) => {
	try {
		if (id == null) {
			console.error("Update called without a valid id");
			return;
		}
		await updateParking(id, editParking.value);
		editId.value = null;
		await fetchParkings();
	} catch (e) {
		logAxiosError("Failed to update parking", e);
	}
};

/* ---------- delete ---------- */
const handleDelete = async (id) => {
	try {
		if (id == null) {
			console.error("Delete called without a valid id");
			return;
		}
		await deleteParking(id);
		await fetchParkings();
	} catch (e) {
		logAxiosError("Failed to delete parking", e);
	}
};

onMounted(() => {
	console.log("[mounted] fetching parkings…");
	fetchParkings();
});
</script>

<style scoped>
.parkings-page {
	max-width: 720px;
	margin: auto;
	padding: 2rem;
	line-height: 1.4;
}

form {
	margin-bottom: 1rem;
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

input,
select,
button {
	padding: 0.5rem;
}

.checkbox {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}

ul {
	list-style: none;
	padding-left: 0;
}

li {
	border: 1px solid #eee;
	border-radius: 8px;
	padding: 0.75rem;
	margin-bottom: 0.75rem;
}
</style>
