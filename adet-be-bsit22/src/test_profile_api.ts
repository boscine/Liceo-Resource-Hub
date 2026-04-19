import prisma from './lib/prisma';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const user = await prisma.user.findFirst();
  const token = jwt.sign({ id: user?.id, role: user?.role }, process.env.JWT_SECRET || 'secret');
  
  const res = await fetch('http://localhost:3000/api/v1/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(await res.json());
}
test().finally(() => prisma.$disconnect());
