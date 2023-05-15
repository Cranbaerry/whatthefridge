import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type ActionFailure } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PRIVATE_SPOONACULAR_KEY } from '$env/static/private'

export const actions: Actions = {
	async login({
		request,
		locals: { supabase }
	}): Promise<ActionFailure<{ error: string; values?: { email: string } }> | { message: string; login: boolean }> {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			return fail(400, {
				error: 'Please enter your email'
			});
		}
		if (!password) {
			return fail(400, {
				error: 'Please enter your password',
				values: {
					email
				}
			});
		}

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					values: {
						email
					}
				});
			}
			return fail(500, {
				error: 'Server error. Try again later.',
				values: {
					email
				}
			});
		}

		return {
			message: 'Logged in.',
			login: true,
		};
	},

	async register({
		request,
		url,
		locals: { supabase }
	}): Promise<ActionFailure<{ error: string; values?: { email: string } }> | { message: string; login: boolean }> {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			return fail(400, {
				error: 'Please enter your email'
			});
		}
		if (!password) {
			return fail(400, {
				error: 'Please enter a password',
				values: {
					email
				}
			});
		}

		const { error, data } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: url.origin }
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					values: {
						email
					}
				});
			}

			return fail(500, {
				error: 'Server error. Try again later.',
				values: {
					email
				}
			});
		}

		if (data?.user?.identities?.length === 0) {
			return fail(400, {
				error: 'This user already exists!',
				values: {
					email
				}
			});
		}

		return {
			message: 'Please check your email for a magic link to log into the website.',
			login: false,
		};
	},

	async logout({ locals: { supabase } }) {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	},

	async fetchRecipes({
		request,
	}): Promise<ActionFailure<{ error: string }> | { recipes: App.Recipe[] }> {
		const formData = await request.formData();
		const ingredients = (formData.getAll('ingredients') as string[]).join(',');
		const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=30&ranking=2&ignorePantry=true&apiKey=${PRIVATE_SPOONACULAR_KEY}`)

		if (response.status === 200) {
			return {
				recipes: await response.json(),
			};
		} else {
			return fail(500, {
				error: 'External API request failed. Try again later.'
			});
		}
	},

	async fetchRecipeDetail({
		request,
	}): Promise<ActionFailure<{ error: string }> | { detail: App.RecipeDetail, equipments: App.Equipment[], instructions: App.InstructionStep[] }> {
		const formData = await request.formData();
		const recipeId = formData.get('id') as string;
		const recipeDetail = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${PRIVATE_SPOONACULAR_KEY}`);
		const recipeEquipments = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/equipmentWidget.json?apiKey=${PRIVATE_SPOONACULAR_KEY}`);
		const recipeInstructions = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${PRIVATE_SPOONACULAR_KEY}`);
		
		const instructionsData = await recipeInstructions.json();
		const equipmentsData = await recipeEquipments.json();

		if (recipeDetail.status === 200) {
			console.log('equipment', equipmentsData);
			console.log('instructions', instructionsData[0].steps);

			return {
				detail: await recipeDetail.json(),
				equipments: equipmentsData.equipment,
				instructions: instructionsData[0].steps,
			};
		} else {
			return fail(500, {
				error: 'External API request failed. Try again later.'
			});
		}
	},
};
