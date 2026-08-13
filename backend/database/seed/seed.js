import bcrypt from 'bcryptjs';
import { db } from '../../src/config/db.js';

async function seed() {
  console.log('🌱 Seeding QuizMaster database...');

  try {
    // 1. Seed System Admin User
    const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
    const { data: admin, error: adminErr } = await db
      .from('users')
      .upsert(
        [
          {
            email: 'admin@quizmaster.io',
            name: 'Krish (Admin)',
            password_hash: adminPasswordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        ],
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (adminErr) console.error('Admin seed error:', adminErr);
    else console.log('✅ System Admin provisioned: admin@quizmaster.io');

    // 2. Seed User Admin (Krish Bangade) & Student
    const krishPasswordHash = await bcrypt.hash('krish@999', 10);
    await db.from('users').upsert(
      [
        {
          email: 'krishbangade@gmail.com',
          name: 'Krish Bangade (Admin)',
          password_hash: krishPasswordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
        {
          email: 'bangadekrish@gmail.com',
          name: 'Krish Bangade (Student)',
          password_hash: krishPasswordHash,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      ],
      { onConflict: 'email' }
    );
    console.log('✅ User accounts provisioned: krishbangade@gmail.com (ADMIN) & bangadekrish@gmail.com (STUDENT)');

    // 3. Seed Categories
    const categoriesData = [
      { name: 'JavaScript', description: 'Modern JavaScript ES6+, Promises, Async/Await, DOM manipulation.' },
      { name: 'React', description: 'Components, Hooks, State management, JSX, performance optimization.' },
      { name: 'Python', description: 'Core Python data structures, functions, OOP, and script automation.' },
      { name: 'HTML/CSS', description: 'Semantic HTML5, CSS Grid, Flexbox, responsive web design.' },
      { name: 'Node.js & Backend', description: 'REST APIs, Express routing, middleware, authentication, database drivers.' },
      { name: 'Databases & SQL', description: 'PostgreSQL, relational query optimization, indexing, schema design.' },
    ];

    const { data: categories, error: catErr } = await db
      .from('categories')
      .upsert(categoriesData, { onConflict: 'name' })
      .select();

    if (catErr) console.error('Categories seed error:', catErr);
    else console.log(`✅ ${categories?.length || 0} Categories provisioned.`);

    const jsCategory = categories?.find((c) => c.name === 'JavaScript') || categories?.[0];

    if (jsCategory && admin) {
      // 4. Seed Sample Quiz
      const { data: quiz, error: quizErr } = await db
        .from('quizzes')
        .upsert(
          [
            {
              title: 'JavaScript ES6+ Masterclass',
              description: 'Test your understanding of modern JavaScript ES6+ features including Promises, Async/Await, Destructuring, and Modules.',
              category_id: jsCategory.id,
              difficulty: 'MEDIUM',
              duration_minutes: 20,
              passing_score: 75,
              max_attempts: 3,
              status: 'PUBLISHED',
              created_by: admin.id,
            },
          ],
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (quiz) {
        // 5. Seed Questions & Options
        const { data: question } = await db
          .from('questions')
          .insert([
            {
              quiz_id: quiz.id,
              question_text: 'What will be the output of typeof typeof 1 in JavaScript?',
              marks: 5,
              explanation: 'typeof 1 evaluates to string "number", then typeof "number" evaluates to "string".',
              difficulty: 'MEDIUM',
              question_type: 'MULTIPLE_CHOICE',
            },
          ])
          .select()
          .single();

        if (question) {
          await db.from('options').insert([
            { question_id: question.id, option_text: '"number"', is_correct: false },
            { question_id: question.id, option_text: '"string"', is_correct: true },
            { question_id: question.id, option_text: '"undefined"', is_correct: false },
            { question_id: question.id, option_text: 'SyntaxError', is_correct: false },
          ]);
          console.log('✅ Sample Quiz & Question provisioned.');
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seed();
