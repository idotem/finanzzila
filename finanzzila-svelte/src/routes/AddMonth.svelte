<script>
	/**
	 * @type {any}
	 */
	export let message = "Add month";
	export let onCancel = () => {};
	export let onOkay = () => {};

	/**
	 * @type {any}
	 */
	let value;
	let onChange = () => {};

	function _onCancel() {
		onCancel();
		close();
	}

	function _onOkay() {
		onOkay(value);
		close();
	}

	$: onChange(value);
</script>

<h2>{message}</h2>
<div>
	<label for="expnesesFile">Upload a .csv expenses file:</label>
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
		justify-content: space-between;
	}
</style>
