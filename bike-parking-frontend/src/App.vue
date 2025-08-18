<template>
	<div class="container">
		<header
			style="
				display: flex;
				gap: 12px;
				align-items: center;
				justify-content: space-between;
			"
		>
			<h1>Brussels Bike Parkings</h1>
			<!-- <nav style="display: flex; gap: 10px">
				<router-link to="/parkings">Parkings</router-link>
				<router-link to="/bikes">bikes</router-link>
			</nav> -->
		</header>
		<hr />
		<router-view />
	</div>
</template>

<style>
.container {
	max-width: 900px;
	margin: 24px auto;
	padding: 0 12px;
}
a.router-link-active {
	font-weight: 700;
	text-decoration: underline;
}
input,
select,
button {
	padding: 6px 10px;
}
.card {
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 12px;
	margin-bottom: 10px;
}
.row {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}
</style>
