import bcrypt from 'bcrypt';

const password = 'P@$$w0rd!';

const hash = await bcrypt.hash(password, 10);

console.log(hash);