<script>
	import { onMount } from "svelte";
	import { apiData, drinkNames } from "../store.ts";

	onMount(async () => {
		fetch("http://localhost:3000/expenses")
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				apiData.set(data);
			})
			.catch((error) => {
				console.log(error);
				return [];
			});
	});
</script>

<main>
	<h1>Expenses</h1>
	<ul>
		{#each $drinkNames as drinkName}
			<li>{drinkName}</li>
		{/each}
	</ul>
</main>

<style>
</style>
