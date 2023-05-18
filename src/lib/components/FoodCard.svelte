<script lang="ts">
	import Icon from 'svelte-awesome';
	import heart from 'svelte-awesome/icons/heart';
	import { page } from '$app/stores';
	import { getContext, onMount } from 'svelte';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import type { User } from '@supabase/supabase-js';
	import { drawerStore, toastStore } from '@skeletonlabs/skeleton';
	import { enhance, type SubmitFunction } from '$app/forms';
	const { showModalAuth } = getContext('authentication');
	const { removePlaceholder } = getContext('placeholder');

	export let recipe: App.Recipe;
	let loading: boolean = false;
	let changingFav: boolean = false;

	// export let data:any;
	$: ({ supabase, session } = $page.data);
	$: bouncingHeart = changingFav ? 'animate-bounce' : '';
	$: fillHeart = recipe.bookmarked ? '!fill-red-500' : '';

	onMount(async () => {		
		try {
			if (!session?.user) return;

			const { count, error } = await supabase
				.from('favourites')
				.select('*', { count: 'exact', head: true })
				.eq('recipe_id', recipe.id)
				.eq('user_id', session?.user.id);

			if (error) throw error;
			recipe.bookmarked = !count ? false : true;
		} catch (error) {
			toastStore.trigger({
				message: error as string,
				background: 'variant-filled-error'
			});
		} finally {
			// Combine Spooncular likes with Supabase likes =)
			const { count } = await supabase
				.from('favourites')
				.select('*', { count: 'exact', head: true })
				.eq('recipe_id', recipe.id);

			recipe.likes += count;
		}
	});

	const toggleFav = async () => {
		if (!session?.user) {
			showModalAuth();
			return;
		}

		try {
			changingFav = true;
			recipe.likes += recipe.bookmarked ? -1 : 1;
			recipe.bookmarked = !recipe.bookmarked;
			if (recipe.bookmarked) {
				console.log('Liking..');
				const { data, error } = await supabase
					.from('favourites')
					.insert({ recipe_id: recipe.id, user_id: session?.user.id });
				if (error) {
					throw error;
				}
			} else {
				console.log('Unliking..');
				const { data, error } = await supabase
					.from('favourites')
					.delete()
					.eq('recipe_id', recipe.id)
					.eq('user_id', session?.user.id);
				if (error) {
					throw error;
				}
			}
			console.log('Done!');
		} catch (error) {
			console.log(error);
			recipe.likes += recipe.bookmarked ? -1 : 1;
			recipe.bookmarked = !recipe.bookmarked;
			toastStore.trigger({
				message: error as string,
				background: 'variant-filled-error'
			});
		} finally {
			changingFav = false;
		}
	};

	const handleRecipeDetail: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
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

				console.log('recipeInstructions', result.data?.instructions);
			} else if (result.type === 'error') {
				toastStore.trigger({
					message: `Internal Server Error. Please try again later.`,
					background: 'variant-filled-error'
				});
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
					<span><Icon data={heart} class="{fillHeart} {bouncingHeart}" /></span>
					<span>{recipe.likes}</span>
				</button>
			</div>
		</footer>
	</button>
</form>
