import * as XLSX from 'xlsx';
import { db } from '../config/db.js';

export const parseExcelFile = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const parsedQuestions = [];

  for (const row of rawRows) {
    // Flexible Column Key Matching
    const keys = Object.keys(row);

    const getKey = (...possibleNames) => {
      const found = keys.find((k) =>
        possibleNames.some((p) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
      return found ? String(row[found]).trim() : '';
    };

    const questionText = getKey('Question Text', 'Question', 'QuestionText', 'question_text', 'q_text');
    const optA = getKey('Option A', 'Option 1', 'OptionA', 'option_a', 'a');
    const optB = getKey('Option B', 'Option 2', 'OptionB', 'option_b', 'b');
    const optC = getKey('Option C', 'Option 3', 'OptionC', 'option_c', 'c');
    const optD = getKey('Option D', 'Option 4', 'OptionD', 'option_d', 'd');
    const correctRaw = getKey('Correct Answer', 'Correct Option', 'Answer', 'Correct', 'correct_answer');
    const marksRaw = getKey('Marks', 'Points', 'Score', 'marks');
    const explanation = getKey('Explanation', 'Reason', 'explanation');
    const difficultyRaw = getKey('Difficulty', 'Level', 'difficulty');

    if (!questionText || !optA || !optB) {
      continue; // Skip invalid or header-only rows
    }

    const optionsList = [
      { key: 'A', text: optA },
      { key: 'B', text: optB },
    ];
    if (optC) optionsList.push({ key: 'C', text: optC });
    if (optD) optionsList.push({ key: 'D', text: optD });

    // Determine correct option
    let correctIdx = 0;
    const cleanCorrect = correctRaw.toUpperCase().trim();
    if (cleanCorrect === 'A' || cleanCorrect === '1' || cleanCorrect === optA.toUpperCase()) correctIdx = 0;
    else if (cleanCorrect === 'B' || cleanCorrect === '2' || cleanCorrect === optB.toUpperCase()) correctIdx = 1;
    else if (cleanCorrect === 'C' || cleanCorrect === '3' || (optC && cleanCorrect === optC.toUpperCase())) correctIdx = 2;
    else if (cleanCorrect === 'D' || cleanCorrect === '4' || (optD && cleanCorrect === optD.toUpperCase())) correctIdx = 3;

    const formattedOptions = optionsList.map((opt, idx) => ({
      optionText: opt.text,
      isCorrect: idx === correctIdx,
    }));

    const marks = Number(marksRaw) > 0 ? Number(marksRaw) : 1;
    const difficulty = ['EASY', 'HARD'].includes(difficultyRaw.toUpperCase()) ? difficultyRaw.toUpperCase() : 'MEDIUM';

    parsedQuestions.push({
      questionText,
      marks,
      explanation,
      difficulty,
      options: formattedOptions,
    });
  }

  return parsedQuestions;
};

// Fisher-Yates Shuffle algorithm
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const importRandomQuestionsFromExcel = async (quizId, fileBuffer, sampleCount = 20) => {
  const allParsed = parseExcelFile(fileBuffer);
  if (allParsed.length === 0) {
    throw new Error('No valid questions found in the uploaded Excel spreadsheet.');
  }

  // Shuffle and pick random sampleCount (default 20)
  const shuffled = shuffleArray(allParsed);
  const selectedQuestions = shuffled.slice(0, Math.min(sampleCount, shuffled.length));

  let insertedCount = 0;

  for (const q of selectedQuestions) {
    // Insert Question into PostgreSQL
    const { data: createdQ, error: qErr } = await db
      .from('questions')
      .insert([
        {
          quiz_id: quizId,
          question_text: q.questionText,
          marks: q.marks,
          explanation: q.explanation || null,
          difficulty: q.difficulty,
          question_type: 'MULTIPLE_CHOICE',
        },
      ])
      .select()
      .single();

    if (qErr || !createdQ) continue;

    // Insert Options into PostgreSQL
    const optionRecords = q.options.map((opt) => ({
      question_id: createdQ.id,
      option_text: opt.optionText,
      is_correct: opt.isCorrect,
    }));

    await db.from('options').insert(optionRecords);
    insertedCount++;
  }

  return {
    totalInSheet: allParsed.length,
    selectedCount: insertedCount,
  };
};

export const generateExcelTemplateBuffer = () => {
  const templateData = [
    {
      'Question Text': 'What is the output of console.log(typeof NaN) in JavaScript?',
      'Option A': 'number',
      'Option B': 'nan',
      'Option C': 'undefined',
      'Option D': 'object',
      'Correct Answer': 'A',
      'Marks': 2,
      'Explanation': 'NaN is of type number in JavaScript.',
      'Difficulty': 'MEDIUM',
    },
    {
      'Question Text': 'Which keyword is used to declare a constant variable in ES6?',
      'Option A': 'var',
      'Option B': 'let',
      'Option C': 'const',
      'Option D': 'static',
      'Correct Answer': 'C',
      'Marks': 1,
      'Explanation': 'const declares read-only block-scoped constants.',
      'Difficulty': 'EASY',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};
