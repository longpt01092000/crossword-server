import { connect, disconnect, Mongoose } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import { CrosswordSchema } from '../modules/crossword/crossword.model';
import { genPuzzles } from './helpers/crossword-generator';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/crossword-server';

export async function testCrosswordGeneration(): Promise<void> {
  let connection: Mongoose | null = null;
  try {
    connection = await connect(MONGODB_URI);
    const CrosswordModel = connection.model('Crossword', CrosswordSchema);
    const crosswords = await CrosswordModel.find({ isSyncGenPuzzles: false });

    console.log(
      `Found ${crosswords.length} crosswords with isSyncGenPuzzles = false`,
    );

    for (const crossword of crosswords) {
      console.log(`\n--- Testing crossword: ${crossword.title} ---`);
      console.log(`Crossword ID: ${crossword._id.toString()}`);
      console.log(`Number of words: ${crossword.words.length}`);
      console.log(`Words: ${crossword.words.map((w) => w.word).join(', ')}`);

      const inputWordClues = crossword.words.map((word) => ({
        word: word.word,
        clue: word.clue,
      }));

      try {
        const puzzles = genPuzzles(inputWordClues);
        crossword.words = puzzles[0].wordClues;
        await crossword.save();
        console.log('Updated crossword with new xy and dir values');
      } catch (error) {
        console.error(
          `❌ ERROR in crossword "${crossword.title}" (ID: ${crossword._id.toString()}):`,
        );
        console.error(
          `Words: ${crossword.words.map((w) => w.word).join(', ')}`,
        );
        console.error(`Error details:`, error.message);
        console.error(`Stack trace:`, error.stack);
        throw error; // Re-throw to stop execution
      }
    }
  } finally {
    if (connection) await disconnect();
  }
}

if (require.main === module) {
  testCrosswordGeneration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
