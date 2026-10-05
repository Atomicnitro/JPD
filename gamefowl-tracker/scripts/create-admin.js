// Creates (or upgrades) an admin account.
// Usage:  npm run create-admin -- you@example.com YourPassword "Your Name"
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const [, , email, password, ...nameParts] = process.argv;
const name = nameParts.join(' ').trim() || null;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase keys. Fill in your .env file first.');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: npm run create-admin -- you@example.com YourPassword "Your Name"');
  process.exit(1);
}
if (password.length < 6) {
  console.error('The password needs at least 6 characters.');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  let userId;
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    if (!/already|registered|exists/i.test(error.message)) {
      console.error('Could not create the user:', error.message);
      process.exit(1);
    }
    // The login already exists: find it and make it an admin.
    const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      console.error('Could not look up the user:', listError.message);
      process.exit(1);
    }
    const found = list.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (!found) {
      console.error('That email exists but could not be found. Check your Supabase project.');
      process.exit(1);
    }
    userId = found.id;
    await db.auth.admin.updateUserById(userId, { password });
  } else {
    userId = data.user.id;
  }

  const { error: profileError } = await db
    .from('profiles')
    .upsert({ id: userId, email, full_name: name, role: 'admin' });
  if (profileError) {
    console.error('Could not save the admin profile:', profileError.message);
    console.error('Did you run supabase/schema.sql in the Supabase SQL Editor?');
    process.exit(1);
  }
  console.log(`Done. ${email} is now an admin. You can log in.`);
})();
