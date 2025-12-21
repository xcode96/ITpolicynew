import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xokjixubgiacycrickzn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhva2ppeHViZ2lhY3ljcmlja3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjk4MDIsImV4cCI6MjA4MTkwNTgwMn0.VRW9-ljj7up9cfuh3APESMVQri38GM-O5YVN3bZs964';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("🛠️ Debugging Policy Creation...");

    const testPolicy = {
        name: "Debug Test Policy " + Date.now(),
        content: "Testing creation",
        category_id: "general"
    };

    const { data, error } = await supabase
        .from('policies')
        .insert([testPolicy])
        .select();

    if (error) {
        console.error("❌ CREATE FAILED:");
        console.error("   Code:", error.code);
        console.error("   Message:", error.message);
        console.error("   Details:", error.details);
        console.error("   Hint:", error.hint);
    } else {
        console.log("✅ Create SUCCESS! (Unexpected if app is failing)");
        console.log("Created:", data);

        // Cleanup
        await supabase.from('policies').delete().eq('id', data[0].id);
    }
}

main();
