const bcrypt = require('bcryptjs');
const pool = require('./db');

async function fixAdminPassword() {
  const password = 'Admin@Naftal2024';
  const hash = await bcrypt.hash(password, 10);
  console.log('Generated hash:', hash);
  
  const [result] = await pool.query(
    "UPDATE users SET password = ? WHERE email = 'admin@naftal.dz'",
    [hash]
  );
  
  console.log('Rows updated:', result.affectedRows);
  
  // Verify it works
  const [users] = await pool.query("SELECT * FROM users WHERE email = 'admin@naftal.dz'");
  if (users.length > 0) {
    const match = await bcrypt.compare(password, users[0].password);
    console.log('Password verification after update:', match);
  }
  
  process.exit(0);
}

fixAdminPassword().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
