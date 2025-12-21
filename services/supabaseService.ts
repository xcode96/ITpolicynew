import { supabase } from '../lib/supabase';
import type { Policy, Category } from '../types';

export const supabaseService = {
    // --- Categories ---
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Category[];
    },

    async createCategory(category: Category) {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteCategory(id: string) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- Policies ---
    async getPolicies() {
        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .order('id', { ascending: false }); // Newest first

        if (error) throw error;

        // Map database fields to frontend types if necessary (e.g. snackcase to camelCase)
        // Our DB uses category_id, frontend uses categoryId
        return data.map((p: any) => ({
            ...p,
            categoryId: p.category_id
        })) as Policy[];
    },

    async createPolicy(policy: Omit<Policy, 'id'>) {
        const dbPolicy = {
            name: policy.name,
            content: policy.content,
            category_id: policy.categoryId
        };

        const { data, error } = await supabase
            .from('policies')
            .insert([dbPolicy])
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            categoryId: data.category_id
        } as Policy;
    },

    async updatePolicy(id: number, updates: Partial<Policy>) {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.content) dbUpdates.content = updates.content;
        if (updates.categoryId) dbUpdates.category_id = updates.categoryId;
        dbUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('policies')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            categoryId: data.category_id
        } as Policy;
    },

    async deletePolicy(id: number) {
        const { error } = await supabase
            .from('policies')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
