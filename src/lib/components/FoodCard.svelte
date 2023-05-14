<script lang="ts">
	import Icon from 'svelte-awesome';
	import heart from 'svelte-awesome/icons/heart';
	export let recipe: App.Recipe;
</script>

<a class="relative card card-hover overflow-hidden variant-soft" href="/elements/cards">
	<header>
		<img
			src={recipe.image}
			class="bg-black/50 w-full object-cover"
			alt={recipe.title}
		/>
	</header>
	<!-- <h3
		class="badge variant-filled h3 absolute text-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white "
		data-toc-ignore
	>
		{recipe.title}
	</h3> -->
	<div class="p-4 space-y-4">
		<h4
			class="h3 text-center"
			data-toc-ignore
		>
			{recipe.title}
		</h4>
	</div>
	<footer class="p-4 flex justify-start items-center space-x-4 absolute top-0 right-0">
		<div class="flex-auto flex justify-between items-center badge variant-filled-primary">
			<Icon data={heart} class="mr-2" />
			{recipe.likes}
		</div>
	</footer>
</a>