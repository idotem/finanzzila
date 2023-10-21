<script>
	import { onMount } from "svelte";
	import { apiData, expenses } from "../store";
	import AddMonth from "./AddMonth.svelte";
	import { fly } from "svelte/transition";

	import { bind } from "./Modal.svelte";

	import Popup from "./Popup.svelte";

	import { modal } from "./stores.js";

	let opening = false;
	let opened = false;
	let closing = false;
	let closed = false;

	const showPopup = () => {
		modal.set(Popup);
	};

	const showPopupWithProps = () => {
		modal.set(bind(Popup, { message: "It's a customized popup!" }));
	};

	/**
	 * @type {boolean}
	 */
	let addMonthShowPopup = false;

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
	const month = "January";

	function addMonth() {
		addMonthShowPopup = true;
	}

	/**
	 * @type {FileList}
	 */
	let files;

	$: if (files) {
	}
</script>

<main>
	{#if addMonthShowPopup}
		<AddMonth />
	{/if}
	<h1>Expenses</h1>
	<div class="expenses-buttons">
		<div>
			<button class="add-month" type="submit" on:click={() => addMonth()}>Add Month</button>
			<button class="add-expense" type="submit">Add Expense</button>
		</div>
	</div>
	<div class="mainExpenses">
		<div class="innerExpenses">
			<div class="monthCard">
				<h4>Month: {month}</h4>
				<table>
					{#each $expenses as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
			</div>
			<div class="monthCard">
				<h4>Month: {month}</h4>
				<table>
					{#each $expenses as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
			</div>
			<div class="monthCard">
				<h4>Month: {month}</h4>
				<table>
					{#each $expenses as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
			</div>
			<div class="monthCard">
				<h4>Month: {month}</h4>
				<table>
					{#each $expenses as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
			</div>
			<div class="monthCard">
				<h4>Month:</h4>
				<table>
					{#each $expenses as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
			</div>
			<div class="monthCard">
				<h4>Month: {month}</h4>
				<table>
					{#each $expenses as expense}
						<tr>
							<td>{expense.name}</td>
							<td>{expense.value} MKD</td>
						</tr>
					{/each}
				</table>
			</div>
			<div class="monthCard">
				<h4>Month: {month}</h4>
				<table>
					{#each $expenses as expense}
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
