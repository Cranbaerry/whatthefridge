<script lang="ts">
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	// Imports
	import { modalStore, TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { onMount } from 'svelte';
	import Icon from 'svelte-awesome';
	import warning from 'svelte-awesome/icons/warning';
	import check from 'svelte-awesome/icons/check';
	import { invalidate } from '$app/navigation';
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';

	let tabSet: number = $modalStore[0].meta.tabSet ?? 0;
	const form: { email: string, password: string, loading: boolean, error: string | null, success: string | null } = {
		email: "",
		password: "",
		loading: false,
		error: null,
		success: null,
	};

	const handleSubmit: SubmitFunction = () => {
		form.loading = true;
		return async ({ result }) => {
			console.log(result);
			if (result.type === 'failure') {
				form.error = result.data?.error;
			}

			if (result.type === 'success') {
				if (result.data?.login) {
					await invalidate('supabase:auth');
					parent.onClose();

					const t: ToastSettings = {
						message: 'Welcome back, ' + $page.data.session?.user.email + '!',
						background: 'variant-filled-success',
					};
					toastStore.trigger(t);
				} else {
					form.success = result.data?.message;
				}
			}
		
			await applyAction(result);
			form.loading = false;
		};
	};

	onMount(async () => {
		form.email = '';
		form.password = '';
		form.loading = false;
		form.error = null;
		form.success = null;
	});	
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		<header class='text-2xl font-bold'>{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>

		{#if form.success}
		<aside class="alert variant-filled-success">
			<!-- Icon -->
			<Icon data="{check}" scale={2} />
			<!-- Message -->
			<div class="alert-message">
				<p>{form.success}</p>
			</div>
		</aside>
		{:else if form.error}
		<aside class="alert variant-filled-error">
			<!-- Icon -->
			<Icon data="{warning}" scale={2} />
			<!-- Message -->
			<div class="alert-message">
				<p>{form.error}</p>
			</div>
		</aside>
		{/if}

		<TabGroup hover="hover:variant-soft-primary">
			<Tab bind:group={tabSet} name="tab1" value={0}>Sign In</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Register</Tab>
			<Tab bind:group={tabSet} name="tab3" value={2}>Forgot your password?</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
				<form class="px-3 modal-form space-y-4 rounded-container-token" method="POST" use:enhance={handleSubmit} autocomplete="off">
					<label class="label">
						<span>Email</span>
						<input class="input" type="email" name="email" value={form.password} placeholder="Enter email..." />
					</label>
					<label class="label">
						<span>Password</span>
						<input class="input" type="password" name="password" value={form.password} placeholder="Enter password..." />
					</label>
				
					<footer class="modal-footer {parent.regionFooter}">
						<button class="btn {parent.buttonNeutral}" on:click|preventDefault={parent.onClose}>{parent.buttonTextCancel}</button>
						<button class="btn {parent.buttonPositive}" disabled={form.loading} formaction="?/login">Log In</button>
					</footer>
				</form>

				{:else if tabSet === 1}
				<form class="px-3 modal-form space-y-4 rounded-container-token" method="POST" use:enhance={handleSubmit} autocomplete="off">
					<label class="label">
						<span>Email</span>
						<input class="input" type="email" name="email" value={form.password} placeholder="Enter email..." />
					</label>
					<label class="label">
						<span>Password</span>
						<input class="input" type="password" name="password" value={form.password} placeholder="Enter password..." />
					</label>
				
					<footer class="modal-footer {parent.regionFooter}">
						<button class="btn {parent.buttonNeutral}" on:click|preventDefault={parent.onClose}>{parent.buttonTextCancel}</button>
						<button class="btn {parent.buttonPositive}" disabled={form.loading} formaction="?/register">Sign up</button>
					</footer>
				</form>

				{:else if tabSet === 2}
					(tab panel 3 contents)
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
{/if}
