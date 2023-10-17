<script>
	import { onMount } from "svelte";
	import { apiData, expenses } from "../store";

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
		<table>
			{#each $expenses as expense}
				<tr>
					<td>{expense.name}</td>
					<td>{expense.value}</td>
				</tr>
			{/each}
		</table>
	</ul>
</main>

<style>
</style>
