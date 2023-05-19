<script>
	import { page } from '$app/stores';
</script>

<div class="container h-full mx-auto py-10 px-5 flex flex-col justify-center items-center">
	<h1 style="font-size: 9rem !important; line-height: 9rem;">{$page.status}</h1>
	<p class="py-5 " style="font-size: 5rem; font-weight: 100 !important;">{$page.error?.message}</p>
    <p><a class="btn btn-sm variant-filled mt-10" href="/">Go back to homepage</a></p>
</div>