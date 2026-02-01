const bcrypt = require('bcryptjs');

const password = 'RoTech2026!';

bcrypt.hash(password, 12).then(hash => {
  console.log('\n=== KOPIEER DEZE WAARDEN NAAR SUPABASE ===\n');
  console.log('Wachtwoord hash (password kolom):');
  console.log(hash);
  console.log('\n');
});
