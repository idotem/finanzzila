<script>
	// @ts-nocheck

	import { onMount } from "svelte";
	import AddMonth from "./AddMonth.svelte";
	import { writable } from "svelte/store";
	import Modal, { bind } from "svelte-simple-modal";
	const modal = writable(null);
	const showModal = () =>
		modal.set(bind(AddMonth, { message: "Add month", onCancel: () => cancelAddMonth() }));

	function cancelAddMonth() {
		modal.set(null);
	}

	let monthData = { expenses: [], income: [], notMapped: [] };

	onMount(async () => {
		fetch("http://localhost:3000/expenses")
			.then((response) => response.json())
			.then((data) => {
				monthData = data;
			})
			.catch((error) => {
				return [];
			});
	});
	const month = "January";
</script>

<main>
	<h1>Expenses</h1>
	<div class="expenses-buttons">
		<div>
			<Modal show={$modal}>
				<button on:click={showModal}>Add month</button>
			</Modal>
			<button class="add-expense" type="submit">Add Expense</button>
		</div>
	</div>
	<div class="mainExpenses">
		<div class="innerExpenses">
			<div class="monthCard">
				<h4>Month: {month}</h4>
				<h5>Income</h5>
				<table>
					{#each monthData.income as income}
						<tr>
							<td>{income.name}</td>
							<td>{income.value} MKD</td>
						</tr>
					{/each}
				</table>
				<h5>Expenses</h5>
				<table>
					{#each monthData.expenses as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
				<h6>Not Mapped</h6>
				<table>
					{#each monthData.notMapped as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
			</div>
		</div>
	</div>
</main>

<style>
	.mainExpenses {
		margin: auto;
	}
	.innerExpenses {
		text-align: center;
	}
	.expenses-buttons {
		width: 100%;
		height: 40px;
		margin-bottom: 20px;
	}
	.expenses-buttons div {
		float: right;
	}
	.monthCard {
		margin: 2rem;
		width: 22rem;
		display: inline-block;
		border: 1px solid black;
		border-radius: 20px;
	}
	table tr td {
		padding: 5px;
	}
	table tr td:nth-child(2) {
		text-align: right;
	}
	table tr td:nth-child(1) {
		padding-right: 20px;
		text-align: left;
	}
</style>
