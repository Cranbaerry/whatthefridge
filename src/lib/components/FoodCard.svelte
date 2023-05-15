<script lang="ts">
	import Icon from 'svelte-awesome';
	import heart from 'svelte-awesome/icons/heart';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	export let recipe: App.Recipe;
	let heartStyle: string;
	let loading: boolean = false;
	const { showModalAuth } = getContext('authentication');
	
	const toggleFav = () => {
		if (!$page.data.session) {
			showModalAuth();
			return;
		}

		// recipe.likes += recipe.isFav ? -1 : 1;
		loading = true;
		recipe.bookmarked = !recipe.bookmarked;
		const fillRed = recipe.bookmarked ? '!fill-red-500' : '';
		heartStyle = `${fillRed} animate-bounce`;
		setTimeout(() => {
			heartStyle = fillRed;
			loading = false;
		}, 500);
	};

	const imageLoaded = (e: any) => {
		const placeholder = e.target.parentElement;
		placeholder.removeAttribute('data-placeholder');
		console.log('loaded', e.target);
	};
</script>

<a class="relative card card-hover overflow-hidden variant-soft" href="#">
	<header data-placeholder class="overflow-hidden relative bg-gray-200" style="min-height: 15rem;">
		<!-- <img src={recipe.image} class="object-contain w-full" alt={recipe.title} /> -->
		<img
			src={recipe.image}
			class="object-contain w-full"
			alt={recipe.title}
			on:load={imageLoaded}
		/>
	</header>

	<div class="p-4 space-y-4 h-20 max-h-20">
		<h4 class="h3 text-center" data-toc-ignore>
			{recipe.title}
		</h4>
	</div>
	<footer class="p-4 flex justify-start items-center space-x-4 absolute top-0 right-0">
		<div class="flex-auto flex justify-between items-center">
			<button type="button" class="btn btn-sm badge variant-filled-surface" on:click={toggleFav}>
				<span><Icon data={heart} class={heartStyle} /></span>
				<span>{recipe.likes}</span>
			</button>
		</div>
	</footer>
</a>
