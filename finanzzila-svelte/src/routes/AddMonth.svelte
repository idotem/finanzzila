<script>
	/**
	 * @type {any}
	 */
	export let message;
	export let onCancel = () => {};
	export let onOkay = () => {};

	/**
	 * @type {any}
	 */
	let value;
	let onChange = () => {};

	function _onCancel() {
		onCancel();
	}

	function _onOkay() {
		onOkay(value);
	}

	$: onChange(value);

	/**
	 * @type {FileList}
	 */
	let files;

	$: if (files) {
	}
</script>

<h2>{message}</h2>
<div>
	<label for="expensesFile">Upload a .csv expenses file:</label>
	<input accept="application/csv" id="expensesFile" name="expensesFile" type="file" />
</div>

<div class="buttons">
	<button on:click={_onCancel}> Cancel </button>
	<button on:click={_onOkay}> Okay </button>
</div>

<style>
	h2 {
		font-size: 2rem;
		text-align: center;
	}

	input {
		width: 100%;
	}

	.buttons {
		display: flex;
		justify-content: end;
	}
	.buttons button:nth-child(1) {
		background-color: red;
	}
	.buttons button:nth-child(2) {
		background-color: green;
		color: white;
		margin-left: 20px;
	}
</style>
