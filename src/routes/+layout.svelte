<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-modern.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';

	import { Modal, modalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
	import AuthenticationForm from '$lib/components/AuthenticationForm.svelte';
	import { page } from '$app/stores';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';

	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	
	function modalAuthComponentForm(): void {
		const c: ModalComponent = { ref: AuthenticationForm };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Authentication Required',
			body: 'Complete the form below and then press submit.',
			response: (r: any) => console.log('response:', r)
		};
		modalStore.trigger(modal);
	}

	let loading:boolean = false
	const handleLogout: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
				const t: ToastSettings = {
					message: 'You have been logged out. See you soon!',
					background: 'variant-soft-secondary',
				};
				
				await invalidate('supabase:auth');
				toastStore.trigger(t);
			} else {
				await applyAction(result);
			}
			loading = false;
		};
	};
</script>
<Modal />
<Toast />
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">	
				<strong class="text-xl uppercase">Whatthefridge</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-soft-surface"
					href="/"
					rel="noreferrer"
				>
					Home
				</a>
				<button class="btn btn-sm variant-soft-surface" on:click={modalAuthComponentForm}>My Recipes</button>
				<a
					class="btn btn-sm variant-soft-surface"
					href="/about"
					target="_blank"
					rel="noreferrer"
				>
					About
				</a>
				{#if $page.data.session}
				<form action="?/logout" method="post" use:enhance={handleLogout}>
					<button class="btn btn-sm variant-soft-surface" disabled={loading} type="submit">Sign out</button>
				</form>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
