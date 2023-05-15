<script lang="ts">
	import Icon from 'svelte-awesome';
	import heart from 'svelte-awesome/icons/heart';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	export let recipe: App.Recipe;
	let heartStyle: string;
	let loading: boolean = false;
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import { drawerStore } from '@skeletonlabs/skeleton';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const { showModalAuth } = getContext('authentication');
	const { removePlaceholder } = getContext('placeholder');

	const toggleFav = () => {
		if (!$page.data.session) {
			showModalAuth();
			return;
		}

		// recipe.likes += recipe.isFav ? -1 : 1;
		recipe.bookmarked = !recipe.bookmarked;
		const fillRed = recipe.bookmarked ? '!fill-red-500' : '';
		heartStyle = `${fillRed} animate-bounce`;
		setTimeout(() => {
			heartStyle = fillRed;
		}, 500);
	};

	const handleRecipeDetail: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			let t: ToastSettings;
			if (result.type === 'success') {
				// Strip HTML tags from summary
				let recipeDetail = result.data?.detail;
				recipeDetail.summary = recipeDetail.summary.replace(/<\/?[^>]+(>|$)/g, '');

				const drawerSettings: DrawerSettings = {
					id: 'recipe',
					// Provide your property overrides:
					// bgDrawer: 'bg-purple-900 text-white',
					// bgBackdrop: 'bg-gradient-to-tr from-indigo-500/50 via-purple-500/50 to-pink-500/50',
					width: 'w-[280px] md:w-[550px]',
					// padding: 'p-4',
					// rounded: 'rounded-xl',
					meta: {
						recipeDetail: recipeDetail,
						recipeEquipments: result.data?.equipments,
						recipeInstructions: result.data?.instructions
					}
				};				
				drawerStore.open(drawerSettings);

				console.log('recipeInstructions', result.data?.instructions)
			} else if (result.type === 'error') {
				t = {
					message: `Internal Server Error. Please try again later.`,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			}
			loading = false;
		};
	};
</script>

<form action="?/fetchRecipeDetail" method="post" use:enhance={handleRecipeDetail}>
	<button class="relative card card-hover overflow-hidden variant-soft w-full" disabled={loading}>
		<input name="id" type="hidden" value={recipe.id} />
		<header
			data-placeholder
			class="overflow-hidden relative bg-gray-200 w-full h-[17rem]"
			style="min-height: 15rem;"
		>
			<img
				src={recipe.image}
				class="object-cover w-full h-full"
				alt={recipe.title}
				on:load={removePlaceholder}
			/>
		</header>

		<div class="p-4 space-y-4 h-full">
			<h4 class="h3 text-center truncate" data-toc-ignore>
				{recipe.title}
			</h4>
		</div>
		<footer class="p-4 flex justify-start items-center space-x-4 absolute top-0 right-0">
			<div class="flex-auto flex justify-between items-center">
				<button
					type="button"
					class="btn btn-sm badge variant-filled-surface"
					on:click|stopPropagation|preventDefault={toggleFav}
				>
					<span><Icon data={heart} class={heartStyle} /></span>
					<span>{recipe.likes}</span>
				</button>
			</div>
		</footer>
	</button>
</form>
