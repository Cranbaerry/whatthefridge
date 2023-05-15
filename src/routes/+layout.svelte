<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-modern.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/all.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';

	import { Modal, modalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
	import AuthenticationForm from '$lib/components/AuthenticationForm.svelte';
	import { page } from '$app/stores';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { setContext } from 'svelte';

	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { Stepper, Step } from '@skeletonlabs/skeleton';
	import Icon from 'svelte-awesome';
	import shoppingBasket from 'svelte-awesome/icons/shoppingBasket';
	import listOl from 'svelte-awesome/icons/listOl';
	import cutlery from 'svelte-awesome/icons/cutlery';
	import clock from 'svelte-awesome/icons/clockO';
	import { Avatar } from '@skeletonlabs/skeleton';
	import book from 'svelte-awesome/icons/book';
	import github from 'svelte-awesome/icons/github';


	function showModalAuth(): void {
		const c: ModalComponent = { ref: AuthenticationForm };
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			title: 'Authentication Required',
			body: 'Complete the form below and then press submit.',
			response: (r: any) => console.log('response:', r),
			meta: { tabSet: 0 }
		};
		modalStore.trigger(modal);
	}

	let loading: boolean = false;
	const handleLogout: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
				const t: ToastSettings = {
					message: 'You have been logged out. See you soon!',
					background: 'variant-filled-secondary'
				};

				await invalidate('supabase:auth');
				toastStore.trigger(t);
			} else {
				await applyAction(result);
			}
			loading = false;
		};
	};

	const removePlaceholder = (e: any) => {
		const placeholder = e.target.parentElement;
		placeholder.removeAttribute('data-placeholder');
	};

	const onCompleteHandler = () => {
		const t: ToastSettings = {
			message: 'Congratulations, you have made it to the last step. The food looks tasty! 🤤',
			background: 'variant-filled-success'
		};

		toastStore.trigger(t);
	};

	setContext('authentication', { showModalAuth });
	setContext('placeholder', { removePlaceholder });
</script>

<Modal />
<Toast />
<Drawer>
	{#if $drawerStore.id === 'recipe'}
		<div class="w-full h-full space-y-5">
			<div
				data-placeholder
				class="overflow-hidden relative bg-gray-200 w-full h-[17rem]"
				style="min-height: 15rem;"
			>
				<img
					src={$drawerStore.meta.recipeDetail.image}
					class="object-cover w-full h-full"
					alt={$drawerStore.meta.recipeDetail.title}
					on:load={removePlaceholder}
				/>
			</div>
			<div class="w-full px-3">
				<div class="text-center">
					<h2 class="mb-3">{$drawerStore.meta.recipeDetail.title}</h2>
					<span class="badge variant-filled"
						><Icon data={clock} class="mr-2" />
						{$drawerStore.meta.recipeDetail.readyInMinutes} minutes</span
					>
				</div>
				<Accordion>
					<AccordionItem open>
						<svelte:fragment slot="lead"><Icon data={book} /></svelte:fragment>
						<svelte:fragment slot="summary">Summary</svelte:fragment>
						<svelte:fragment slot="content">
							<div class="text-sm text-justify">
								{@html $drawerStore.meta.recipeDetail.summary}
							</div>
						</svelte:fragment>
					</AccordionItem>
					<AccordionItem open>
						<svelte:fragment slot="lead"><Icon data={shoppingBasket} /></svelte:fragment>
						<svelte:fragment slot="summary">Ingredients</svelte:fragment>
						<svelte:fragment slot="content">
							<dl class="list-dl">
								{#each $drawerStore.meta.recipeDetail.extendedIngredients as ingredient}
									<div>
										<span class="bg-gray-200">
											<Avatar
												src="https://spoonacular.com/cdn/ingredients_100x100/{ingredient.image}"
												width="w-12"
											/>
										</span>
										<span class="flex-auto">
											<dt class="font-bold">{ingredient.nameClean}</dt>
											<dd class="text-sm opacity-50">{ingredient.amount} {ingredient.unit}</dd>
										</span>
										<span>⋮</span>
									</div>
								{/each}
							</dl>
						</svelte:fragment>
					</AccordionItem>
					<AccordionItem open>
						<svelte:fragment slot="lead"><Icon data={cutlery} /></svelte:fragment>
						<svelte:fragment slot="summary">Equipment</svelte:fragment>
						<svelte:fragment slot="content">
							<dl class="list-dl">
								{#if $drawerStore.meta.recipeEquipments.length}
									{#each $drawerStore.meta.recipeEquipments as equipment}
										<div>
											<span class="bg-gray-200">
												<Avatar
													src="https://spoonacular.com/cdn/equipment_100x100/{equipment.image}"
													width="w-12"
												/>
											</span>
											<span class="flex-auto">
												<dt class="font-bold">{equipment.name}</dt>
											</span>
											<span>⋮</span>
										</div>
									{/each}
								{:else}
									<div class="text-center">No equipment needed.</div>
								{/if}
							</dl>
						</svelte:fragment>
					</AccordionItem>
					<AccordionItem open>
						<svelte:fragment slot="lead"><Icon data={listOl} /></svelte:fragment>
						<svelte:fragment slot="summary">Instructions</svelte:fragment>
						<svelte:fragment slot="content">
							<Stepper on:complete={onCompleteHandler}>
								{#each $drawerStore.meta.recipeInstructions as instruction}
									<Step>
										<svelte:fragment slot="header">Step {instruction.number}</svelte:fragment>
										{instruction.step}
										<div class="flex flex-row space-x-2 mt-3">
											{#each instruction.ingredients as ingredient}
												<span class="badge variant-soft-secondary">{ingredient.name}</span>
											{/each}
											{#each instruction.equipment as equipment}
												<span class="badge variant-soft-secondary">{equipment.name}</span>
											{/each}
										</div>
									</Step>
								{/each}
								<!-- ... -->
							</Stepper>
						</svelte:fragment>
					</AccordionItem>
					<!-- ... -->
				</Accordion>
				<span class="block text-center py-10">Tap outside the drawer to close.</span>
			</div>
		</div>
	{/if}
</Drawer>
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Whatthefridge</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a class="btn btn-sm variant-soft-surface" href="/" rel="noreferrer"> Home </a>
				<button class="btn btn-sm variant-soft-surface" on:click={showModalAuth}>My Recipes</button>
				<a class="btn btn-sm variant-soft-surface" href="/about" target="_blank" rel="noreferrer">
					About
				</a>
				{#if $page.data.session}
					<form action="?/logout" method="post" use:enhance={handleLogout}>
						<button class="btn btn-sm variant-soft-surface" disabled={loading} type="submit"
							>Sign out</button
						>
					</form>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />

	<svelte:fragment slot="pageFooter">
		<footer class="text-center p-5">
			<p>Made with ❤️ in BINUS.</p>
			<p>Powered by <a href="https://www.skeleton.dev/" target="_blank" class="!no-underline !text-secondary-900">Skeleton</a> and <a href="https://supabase.com/" target="_blank" class="!no-underline !text-secondary-900">Supabase</a>.</p>

		</footer>
		
	</svelte:fragment>
</AppShell>
