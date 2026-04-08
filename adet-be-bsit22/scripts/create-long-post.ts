
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // 1. Find an admin user
    let admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.log('No admin found, creating a dummy admin...');
      admin = await prisma.user.create({
        data: {
          email: 'admin@liceo.edu.ph',
          passwordHash: 'dummy_hash',
          displayName: 'Administrator',
          role: 'admin',
          status: 'active'
        }
      });
    }

    // 2. Find a category
    let category = await prisma.category.findFirst();
    if (!category) {
      console.log('No category found, creating textbook category...');
      category = await prisma.category.create({
        data: { name: 'Textbook' }
      });
    }

    const description = `The investigation into the multifaceted dimensions of pedagogical strategies within the higher education landscape reveals a compelling narrative regarding the intersection of classical instructional methods and contemporary digital transformations. As we traverse the initial quartiles of the twenty-first century, the traditional lecture-centric paradigm is increasingly scrutinized in favor of more dynamic, learner-centered engagement models that emphasize heuristic inquiry and collaborative problem-solving. This shift is not merely a superficial adjustment but represents a fundamental tectonic realignment of educational values, prioritizing cognitive flexibility and critical synthesis over rote memorization.

Within the context of the Liceo de Cagayan University ecosystem, this transition takes on a unique cultural and institutional character, as the institution seeks to bridge the gap between regional academic traditions and global educational standards. The adoption of the Liceo Resource Hub as a central node for scholastic exchange further exemplifies this evolution, providing a decentralized yet robust infrastructure for researchers and students alike. This platform serves as more than just a repository for physical and digital assets; it functions as a digital agora where intellectual capital is shared, redistributed, and ultimately amplified.

The pedagogical landscape of higher education is undergoing a profound transformation, driven by the dual forces of technological innovation and a shifting understanding of adult learning theory. At Liceo de Cagayan University, this evolution is manifest in the increasing reliance on collaborative frameworks that transcend the traditional boundaries of the classroom. The Liceo Resource Hub stands at the forefront of this movement, providing a sophisticated platform for the exchange of academic resources, from complex laboratory equipment to specialized software suites and rare primary source documents.

This decentralized exchange model capitalizes on the dormant potential within the student body, operationalizing the principle of shared scholastic equity. When a student posts a request for a high-level mathematical calculator or a comprehensive nursing reference guide, they are participating in a larger institutional dialogue about resource optimization and academic solidarity. The technical architecture of the platform, built on modern web standards, ensures that these requests are visible, searchable, and ultimately fulfilled through the 'Scholarly Cooperation' model.

This model prioritizes human connection and academic proximity, encouraging students from various colleges—be it Engineering, Nursing, or the Arts—to interact in a context directed solely towards academic progress. Furthermore, the integration of 6-digit Email OTP verification and domain-locked registration ensures that this ecosystem remains a safe, internal harbor for Liceonians. The aesthetic choice of 'The Academic Curator' theme—rich with Maroon and Academia Gold—is not merely decorative; it is a psychological signal that the interactions occurring here are part of a noble, time-honored tradition of university life.

As we move towards a more interconnected future, the data suggests that platforms like this significantly reduce the financial bar for high-quality education, allowing students to access the tools they need without the prohibitive costs of permanent ownership. This particular entry, being a test of the platform’s capacity for long-form scholarly description, serves to demonstrate that the Liceo Resource Hub can handle not just simple listings, but exhaustive academic inquiries that require deep context and professional justification. Whether it is a request for a vintage surveyor's transit or a contemporary data analysis software license, the platform stands ready to facilitate.

In conclusion, the continued refinement of this system, including the hardening of backend validation and the optimization of mobile performance, will ensure that the Liceo Resource Hub remains a cornerstone of student life for years to come. By facilitating the exchange of such critical tools, we are not just sharing hardware; we are fostering a culture of mutual support and collective ambition that defines the true spirit of the Academic Curator. Let this be a testament to our commitment to academic excellence across all disciplines within the Liceo de Cagayan University. This test post successfully verifies that the system can maintain database integrity even with significant textual payloads, ensuring that scholars are never limited by character constraints when describing their genuine academic needs. We look forward to seeing the platform grow and evolve as more students join this scholarly network.`;

    // 3. Create the post
    const post = await prisma.post.create({
      data: {
        userId: admin.id,
        categoryId: category.id,
        title: 'Scholarly Inquiry: Comprehensive Pedagogy & Resource Optimization',
        description: description,
        status: 'open'
      }
    });

    console.log('Post created successfully with ID:', post.id);
    console.log('Description word count approximately:', description.split(/\s+/).length);

  } catch (error) {
    console.error('Error creating post:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
