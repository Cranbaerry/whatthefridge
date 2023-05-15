<script lang="ts">
	import logo from '$lib/assets/logo.svg';
	import { InputChip, Paginator } from '@skeletonlabs/skeleton';
	import FoodCard from '$lib/components/FoodCard.svelte';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import Icon from 'svelte-awesome';
	import spinner from 'svelte-awesome/icons/spinner';
	import search from 'svelte-awesome/icons/search';

	let recipes: App.Recipe[] = [];
	let list: string[] = ['apple'];
	let loading: boolean = false;

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

	const handleRecipes: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			console.log(result);
			let t: ToastSettings;
			if (result.type === 'success') {
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
				t = {
					message: `Something went wrong. Please try again later.`,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			} else if (result.type === 'failure') {
				t = {
					message: result.data?.error,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			}
			loading = false;
		};
	};
</script>

<div class="container h-full mx-auto py-10 px-5 flex flex-col justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<!-- Animated Logo -->
		<figure>
			<section class="img-bg" />
			<img src={logo} alt="WhatTheFridge" />
			<h2 class="h2 mt-2 font-bold">Find out what you can make with what you have</h2>
		</figure>
		<!-- / -->
		<form action="?/fetchRecipes" method="post" class="w-full" use:enhance={handleRecipes}>
			<InputChip
				bind:value={list}
				chips="variant-filled-primary"
				name="ingredients"
				placeholder="Enter any ingredients..."
			/>

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
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite, glow 5s linear infinite;
		margin: 0 auto;
		left: 0;
		right: 0;
	}
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
