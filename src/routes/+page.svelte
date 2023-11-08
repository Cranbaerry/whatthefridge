<script lang="ts">
	import logo from '$lib/assets/wtf.png';
	import { InputChip, Paginator } from '@skeletonlabs/skeleton';
	import FoodCard from '$lib/components/FoodCard.svelte';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import Icon from 'svelte-awesome';
	import spinner from 'svelte-awesome/icons/spinner';
	import search from 'svelte-awesome/icons/search';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let recipes: App.Recipe[] = [];
	let list: string[] = ['cranberry'];
	let loading: boolean = false;
	let searchBy: 'ingredients' | 'name' = 'ingredients';
	let searchByNameValue: string;
	let rendered = false;
	import { apiConfig } from '$lib/apiConfig';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: ({ session } = data);

	$: recipesCount = recipes.length;
	$: paginatorSettings = {
		offset: 0,
		limit: 12,
		size: recipesCount,
		amounts: [4, 8, 12, 16, 20]
	};
	$: paginatedRecipes = recipes.slice(
		paginatorSettings.offset * paginatorSettings.limit,
		paginatorSettings.offset * paginatorSettings.limit + paginatorSettings.limit
	);

	var loginStatus = true;
	$: if (session?.user) {
		loginStatus = true;
	} else {
		loginStatus = false;
	}

	$: onLoginStatusChange(loginStatus);

	const onLoginStatusChange = async (loginStatus: boolean) => {
		if (loginStatus) {
			let requestList: String[] = [];
			recipes.forEach((recipe) => {
				requestList.push( `${apiConfig.recipes.getBookmarks}/${recipe.id}`);
			});

			const requests = requestList.map((request) => fetch(new URL(request.toString())));
			const responses = await Promise.all(requests);
			const promises = responses.map((response) => response.json());
			const result = await Promise.all(promises);

			result.forEach((result) => {
				if (result.type === 'success') {
					// loop through result.data.rows and check if user has liked the recipe
					for (var likeData of result.data?.rows) {
						let recipe = recipes.find((r) => r.id === likeData.recipe_id);
						if (recipe) {
							if (likeData.user_id === session?.user?.id) {
								recipe.bookmarked = true;
								recipe.totalLikes = result.data?.count;
							}
						}
					}
				}
			});

			// force re-render
			recipes = recipes; 
		} else {
			recipes.forEach((recipe) => {
				recipe.bookmarked = false;
			});
		}
	};

	onMount(async () => {
		if (location.hash.indexOf('#access_token=') > -1) {
			const token = new URLSearchParams(document.location.hash.slice(1)).get('access_token');
			document.cookie = 'sb-auth-token=' + token + '; path=/; SameSite=Strict; Secure';
			await invalidateAll();
			const cleanedUrl = window.location.href.split('#')[0];
			window.history.replaceState(null, '', cleanedUrl);
		}

		rendered = true;
	});

	/** @param {{ currentTarget: EventTarget & HTMLFormElement}} event */
	async function handleSearchV2(event: any) {
		loading = true;
		const data = new FormData(event.currentTarget);
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data,
			headers: {
				Authorization: `Bearer ${session.token}`
			}
		});

		// Concern: JSON.parse() isn't enough because form actions - like load functions - also support returning Date or BigInt objects.
		const result = await response.json();

		if (result.type === 'success') {
			let t: ToastSettings;
			recipes = result.data?.recipes;
			if (recipes.length === 0) {
				t = {
					message: `Sorry, we couldn't find any recipes with those ingredients.. 😢`,
					background: 'variant-filled-error'
				};
			} else {
				t = {
					message: `We have found ${recipes.length} recipes for you to try! 😋`,
					background: 'variant-filled-tertiary'
				};
			}

			await applyAction(result);
			await invalidateAll();
			toastStore.trigger(t);
		} else if (result.type === 'error') {
			toastStore.trigger({
				message: `Something went wrong. Please try again later.`,
				background: 'variant-filled-error'
			});
		} else if (result.type === 'failure') {
			toastStore.trigger({
				message: result.data?.error,
				background: 'variant-filled-error'
			});
		}

		loading = false;
	}

	const handleRecipes: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				let t: ToastSettings;
				recipes = result.data?.recipes;
				if (recipes.length === 0) {
					t = {
						message: `Sorry, we couldn't find any recipes with those ingredients.. 😢`,
						background: 'variant-filled-error'
					};
				} else {
					t = {
						message: `We have found ${recipes.length} recipes for you to try! 😋`,
						background: 'variant-filled-tertiary'
					};
				}

				await applyAction(result);
				toastStore.trigger(t);
			} else if (result.type === 'error') {
				toastStore.trigger({
					message: `Something went wrong. Please try again later.`,
					background: 'variant-filled-error'
				});
			} else if (result.type === 'failure') {
				toastStore.trigger({
					message: result.data?.error,
					background: 'variant-filled-error'
				});
			}
			loading = false;
		};
	};
</script>

<div class="container h-full mx-auto py-3 lg:py-10 px-5 flex flex-col justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<!-- Animated Logo -->
		<figure class="max-w-[45rem]">
			<!-- <section class="img-bg" /> -->
			<img src={logo} alt="WhatTheFridge" />
			<h3>Find out what you can make, with what you have!</h3>
		</figure>
		<!-- / -->
		<form
			action={apiConfig.recipes.searchRecipes}
			method="post"
			class="w-full"
			on:submit|preventDefault={handleSearchV2}
		>
			{#if searchBy === 'ingredients'}
				<InputChip
					bind:value={list}
					chips="variant-filled-primary"
					name="ingredients[]"
					placeholder="Enter any ingredients..."
					padding="p-3"
				/>
			{:else}
				<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
					<div class="input-group-shim"><Icon data={search} /></div>
					<input
						type="search"
						bind:value={searchByNameValue}
						placeholder="Enter a recipe name..."
					/>
				</div>
				<input type="hidden" name="title" bind:value={searchByNameValue} />
			{/if}

			<RadioGroup>
				<RadioItem bind:group={searchBy} name="type" value={'ingredients'}
					>Search by ingredients</RadioItem
				>
				<RadioItem bind:group={searchBy} name="type" value={'name'}>Search by keywords</RadioItem>
			</RadioGroup>

			<div class="flex justify-center space-x-2 mt-7">
				<button class="btn variant-filled" disabled={loading} type="submit">
					{#if loading}
						<span><Icon data={spinner} pulse /></span>
					{:else}
						<span><Icon data={search} /></span>
					{/if}
					<span>Fridge it!</span>
				</button>
			</div>
		</form>
	</div>

	{#if recipes.length}
		<div class="mx-10 mt-10 w-full text-token grid grid-cols-1 lg:grid-cols-4 gap-8">
			{#each paginatedRecipes as recipe}
				{#key recipe}
					<FoodCard {recipe} />
				{/key}
			{/each}
		</div>
		<Paginator bind:settings={paginatorSettings} class="mt-10" />
	{/if}
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	/* .img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite, glow 5s linear infinite;
		margin: 0 auto;
		left: 0;
		right: 0;
	} */
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>
