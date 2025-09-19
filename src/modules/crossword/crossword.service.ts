import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from '../../core/base-service.core';
import { HashtagService } from '../hashtag/hashtag.service';
import { OpenAIService } from '../../services/openai.service';
import { UserAuth } from '../../interfaces/auth.interface';
import {
  ICrossword,
  Crossword,
  CrosswordDocument,
  CreatedByType,
  DifficultyLevel,
} from './crossword.model';
import { CreateCrosswordDto } from './dto/create-crossword.dto';
import { UpdateCrosswordDto } from './dto/update-crossword.dto';
import { GenerateCrosswordDto } from './dto/generate-crossword.dto';
import { generateSlug } from '../../utils/function.util';

@Injectable()
export class CrosswordService extends BaseService<
  CrosswordDocument,
  ICrossword
> {
  constructor(
    @InjectModel(Crossword.name)
    crosswordModel: Model<CrosswordDocument>,
    private readonly hashtagService: HashtagService,
    private readonly openaiService: OpenAIService,
  ) {
    super(crosswordModel);
  }

  async createCrossword(
    dto: CreateCrosswordDto,
    createdBy: CreatedByType,
    user?: UserAuth,
  ): Promise<ICrossword> {
    console.log(`💾 Creating crossword in database:`, {
      title: dto.title,
      wordCount: dto.words?.length || 0,
      hashtagCount: dto.hashtags?.length || 0,
      createdBy,
    });

    const hashtags = dto.hashtags
      ? dto.hashtags.map((id) => new Types.ObjectId(id))
      : [];
    const data = { ...dto, hashtags } as Partial<CrosswordDocument>;

    console.log(`📝 Crossword data prepared:`, {
      title: data.title,
      size: data.size,
      difficulty: data.difficulty,
      isActive: data.isActive,
      hashtagIds: hashtags.map((h) => h.toString()),
    });

    const result = await super.create({
      ...data,
      author: user ? user.sub : undefined,
      createdBy,
    });

    console.log(
      `✅ Crossword created successfully with ID: ${result._id.toString()}`,
    );

    if (hashtags.length > 0) {
      console.log(`📊 Updating usage count for ${hashtags.length} hashtags`);
      await this.hashtagService.updateMany(
        { _id: { $in: hashtags } },
        { $inc: { usageCount: 1 } },
      );
      console.log(`✅ Hashtag usage counts updated`);
    }

    return result;
  }

  async updateCrossword(
    id: string,
    dto: UpdateCrosswordDto,
  ): Promise<ICrossword | null> {
    const crossword = await super.findById(id);
    if (!crossword) {
      throw new NotFoundException(`Crossword with id "${id}" was not found!`);
    }

    const oldHashtagIds = crossword.hashtags?.map((h) => h) ?? [];
    const newHashtagIds = (dto.hashtags || []).map(
      (id) => new Types.ObjectId(id),
    );

    const added = newHashtagIds.filter(
      (id) => !oldHashtagIds.some((old) => old.equals(id)),
    );
    const removed = oldHashtagIds.filter(
      (id) => !newHashtagIds.some((newId) => newId.equals(id)),
    );
    if (added.length > 0) {
      await this.hashtagService.updateMany(
        { _id: { $in: added } },
        { $inc: { usageCount: 1 } },
      );
    }

    if (removed.length > 0) {
      await this.hashtagService.updateMany(
        { _id: { $in: removed } },
        { $inc: { usageCount: -1 } },
      );
    }

    return await super.update(id, {
      ...dto,
      ...(newHashtagIds.length && { hashtags: newHashtagIds }),
    });
  }

  async findOneWithDetails(id: string): Promise<ICrossword | null> {
    return await this.findById(id, { populate: 'hashtags' });
  }

  async deleteCrossword(id: string): Promise<ICrossword | null> {
    const crossword = await super.findById(id);
    if (!crossword) {
      throw new NotFoundException(`Crossword with id "${id}" was not found!`);
    }

    if (crossword.hashtags && crossword.hashtags.length > 0) {
      const hashtagIds = crossword.hashtags?.map((h) => h) ?? [];

      await this.hashtagService.updateMany(
        { _id: { $in: hashtagIds } },
        { $inc: { usageCount: -1 } },
      );
    }

    return await super.delete(id);
  }

  async findSimilar(
    crosswordId: string,
    limit: number = 5,
  ): Promise<ICrossword[] | null> {
    const crossword = await this.findById(crosswordId);
    if (!crossword) {
      throw new NotFoundException(
        `Crossword with id "${crosswordId}" was not found.`,
      );
    }

    const similarCrosswords = await this.findAllRaw(
      {
        _id: { $ne: new Types.ObjectId(crosswordId) },
        isActive: true,
        hashtags: { $in: crossword.hashtags },
      },
      { sort: { createdAt: -1 }, populate: 'hashtags', limit },
    );

    return similarCrosswords;
  }

  async generateCrosswords(dto: GenerateCrosswordDto): Promise<{
    message: string;
    hashtagsCreated: number;
    hashtagsSkipped: number;
    crosswordsCreated: number;
    crosswordsFailed: number;
  }> {
    console.log('🚀 Starting crossword generation process...');
    console.log('📋 Generation parameters:', {
      category: dto.category,
      topics: dto.topics,
      crosswordsPerTopic: dto.crosswordsPerTopic,
    });

    const categoryData = [{ category: dto.category, topics: dto.topics }];

    console.log('🏷️ Creating hashtags in parallel...');
    const hashtagResults = await this.createHashtagsInParallel(categoryData);
    console.log('✅ Hashtag creation completed:', {
      created: hashtagResults.created,
      skipped: hashtagResults.skipped,
    });

    console.log('📝 Creating crosswords in batches...');
    const crosswordResults = await this.createCrosswordsInBatches(
      categoryData,
      hashtagResults.hashtagMap,
      dto.crosswordsPerTopic,
    );
    console.log('✅ Crossword creation completed:', {
      created: crosswordResults.created,
      failed: crosswordResults.failed,
    });

    const result = {
      message: `Generation completed. Hashtags: ${hashtagResults.created} created, ${hashtagResults.skipped} skipped. Crosswords: ${crosswordResults.created} created, ${crosswordResults.failed} failed.`,
      hashtagsCreated: hashtagResults.created,
      hashtagsSkipped: hashtagResults.skipped,
      crosswordsCreated: crosswordResults.created,
      crosswordsFailed: crosswordResults.failed,
    };

    console.log('🎉 Generation process completed successfully!', result);
    return result;
  }

  async generateFromOpenAI(): Promise<{
    message: string;
    hashtagsCreated: number;
    hashtagsSkipped: number;
    crosswordsCreated: number;
    crosswordsFailed: number;
  }> {
    console.log('🤖 Starting OpenAI-powered crossword generation...');

    const categoryData = [
      // {
      //   category: 'Animals',
      //   topics: [
      //     'Cats',
      //     'Dogs',
      //     'Horses',
      //     'Birds',
      //     'Fish',
      //     'Insects',
      //     'Wild animals',
      //     'Sea creatures',
      //     'Dinosaurs',
      //     'Cartoon animals',
      //   ],
      // },
      // {
      //   category: 'Plants',
      //   topics: [
      //     'Roses',
      //     'Fruit trees',
      //     'Vegetables',
      //     'Herbs',
      //     'Forest trees',
      //     'Cactus',
      //     'Houseplants',
      //     'Seeds',
      //     'Tropical flowers',
      //     'Rare plants',
      //   ],
      // },
      // {
      //   category: 'Food & Drinks',
      //   topics: [
      //     'Vietnamese food',
      //     'Italian cuisine',
      //     'Sushi',
      //     'Desserts',
      //     'Cheese',
      //     'Spices',
      //     'Beverages',
      //     'Cocktails',
      //     'Street food',
      //     'Noodles',
      //   ],
      // },
      // {
      //   category: 'Geography',
      //   topics: [
      //     'World capitals',
      //     'Famous rivers',
      //     'Mountains',
      //     'Oceans & seas',
      //     'Asian countries',
      //     'European countries',
      //     'US cities',
      //     'World wonders',
      //     'Deserts',
      //     'Lakes',
      //   ],
      // },
      // {
      //   category: 'People & Professions',
      //   topics: [
      //     'Artists',
      //     'Scientists',
      //     'Doctors',
      //     'Engineers',
      //     'Teachers',
      //     'Soccer players',
      //     'Historical figures',
      //     'Leaders',
      //     'Traditional jobs',
      //     'Movie characters',
      //   ],
      // },
      // {
      //   category: 'History',
      //   topics: [
      //     'World War I',
      //     'World War II',
      //     'Roman Empire',
      //     'Ancient Egypt',
      //     'Ancient Greece',
      //     'Ancient China',
      //     'Vietnamese history',
      //     'Age of exploration',
      //     'Dynasties',
      //     'Industrial revolution',
      //   ],
      // },
      // {
      //   category: 'Science',
      //   topics: [
      //     'Chemical elements',
      //     'Planets',
      //     'Universe',
      //     'Biology',
      //     'Mathematics',
      //     'Inventions',
      //     'Dinosaurs',
      //     'Computers',
      //     'Robots',
      //     'Artificial intelligence',
      //   ],
      // },
      // {
      //   category: 'Art & Culture',
      //   topics: [
      //     'Famous paintings',
      //     'Sculptures',
      //     'Musical instruments',
      //     'Ballet',
      //     'Opera',
      //     'Classical literature',
      //     'Writers',
      //     'Poets',
      //     'Cinema',
      //     'Hollywood',
      //   ],
      // },
      // {
      //   category: 'Music',
      //   topics: [
      //     'Rock',
      //     'Pop',
      //     'Jazz',
      //     'Rap/HipHop',
      //     'Classical music',
      //     'Famous singers',
      //     'Legendary bands',
      //     'Instruments',
      //     'Movie soundtracks',
      //     'Iconic songs',
      //   ],
      // },
      // {
      //   category: 'Sports',
      //   topics: [
      //     'Soccer',
      //     'Basketball',
      //     'Tennis',
      //     'Badminton',
      //     'Golf',
      //     'Swimming',
      //     'Athletics',
      //     'Martial arts',
      //     'Olympic Games',
      //     'Chess',
      //   ],
      // },
      // {
      //   category: 'Technology',
      //   topics: [
      //     'Programming',
      //     'Social media',
      //     'Smartphones',
      //     'Video games',
      //     'Websites',
      //     'Hardware',
      //     'AI',
      //     'Blockchain',
      //     'Office software',
      //     'Internet',
      //   ],
      // },
      // {
      //   category: 'Travel',
      //   topics: [
      //     'Vietnam destinations',
      //     'European cities',
      //     'Tropical islands',
      //     'Resorts',
      //     'Landmarks',
      //     'Pilgrimage sites',
      //     'Food tourism',
      //     'Trekking',
      //     'Backpacking',
      //     'UNESCO heritage',
      //   ],
      // },
      // {
      //   category: 'Literature & Books',
      //   topics: [
      //     'Famous novels',
      //     'Vietnamese authors',
      //     'Short stories',
      //     "Children's books",
      //     'Fairy tales',
      //     'Book characters',
      //     'Harry Potter',
      //     'Sherlock Holmes',
      //     'Japanese comics',
      //     'Manga/Anime',
      //   ],
      // },
      // {
      //   category: 'Games & Entertainment',
      //   topics: [
      //     'Chess',
      //     'Chinese chess',
      //     'Online games',
      //     'Board games',
      //     'Traditional games',
      //     'Game shows',
      //     'Riddles',
      //     'Crosswords',
      //     'Brain teasers',
      //     'TV games',
      //   ],
      // },
      // {
      //   category: 'Fashion',
      //   topics: [
      //     'Famous brands',
      //     'Traditional clothing',
      //     'Hairstyles',
      //     'Shoes',
      //     'Bags',
      //     'Accessories',
      //     'Designers',
      //     'Jewelry',
      //     'Fabrics',
      //     'Fashion colors',
      //   ],
      // },
      // {
      //   category: 'Movies & TV',
      //   topics: [
      //     'Marvel movies',
      //     'DC movies',
      //     'Horror films',
      //     'Comedy films',
      //     'Animated films',
      //     'Hollywood actors',
      //     'Korean dramas',
      //     'Chinese dramas',
      //     'Netflix series',
      //     'Oscars',
      //   ],
      // },
      // {
      //   category: 'Pop Culture',
      //   topics: [
      //     'Memes',
      //     'YouTubers',
      //     'TikTokers',
      //     'Influencers',
      //     'Viral videos',
      //     'Streamers',
      //     'Podcasts',
      //     'Cartoons',
      //     'Sitcoms',
      //     'Music shows',
      //   ],
      // },
      // {
      //   category: 'Religion & Mythology',
      //   topics: [
      //     'Christianity',
      //     'Buddhism',
      //     'Islam',
      //     'Hinduism',
      //     'Greek mythology',
      //     'Norse mythology',
      //     'Vietnamese legends',
      //     'Gods & goddesses',
      //     'Religious symbols',
      //     'Festivals',
      //   ],
      // },
      // {
      //   category: 'Festivals & Events',
      //   topics: [
      //     'Vietnamese New Year',
      //     'Christmas',
      //     'Halloween',
      //     "Valentine's Day",
      //     'Mid-Autumn festival',
      //     'Music festivals',
      //     'Olympics',
      //     'World Cup',
      //     'Cannes',
      //     'Weddings',
      //   ],
      // },
      // {
      //   category: 'Daily Life',
      //   topics: [
      //     'Family',
      //     'Friends',
      //     'School',
      //     'Work',
      //     'House',
      //     'Household items',
      //     'Fast food',
      //     'Supermarket',
      //     'Pets',
      //     'Hobbies',
      //   ],
      // },
      // {
      //   category: 'Nature',
      //   topics: [
      //     'Rain',
      //     'Wind',
      //     'Storms',
      //     'Volcanoes',
      //     'Earthquakes',
      //     'Rainbow',
      //     'Ice & snow',
      //     'Rainforest',
      //     'Waterfalls',
      //     'Sunset',
      //   ],
      // },
      // {
      //   category: 'Transportation',
      //   topics: [
      //     'Cars',
      //     'Motorbikes',
      //     'Trains',
      //     'Airplanes',
      //     'Ships',
      //     'Buses',
      //     'Subway',
      //     'Bicycles',
      //     'Ports',
      //     'Airlines',
      //   ],
      // },
      // {
      //   category: 'Health & Body',
      //   topics: [
      //     'Body parts',
      //     'Organs',
      //     'Common diseases',
      //     'Yoga',
      //     'Exercise',
      //     'Nutrition',
      //     'Medicine',
      //     'Meditation',
      //     'Diets',
      //     'Famous doctors',
      //   ],
      // },
      // {
      //   category: 'Language & Words',
      //   topics: [
      //     'Synonyms',
      //     'Antonyms',
      //     'English idioms',
      //     'Vietnamese idioms',
      //     'Chinese characters',
      //     'Rare languages',
      //     'Old words',
      //     'Modern slang',
      //     'Acronyms',
      //     'Abbreviations',
      //   ],
      // },
      {
        category: 'Universe',
        topics: [
          'Future',
          'Space',
          'Superheroes',
          'Magic worlds',
          'Steampunk',
          'Cyberpunk',
          'Underworld',
          'Utopia/Dystopia',
          'Artificial intelligence',
          'Aliens',
        ],
      },
    ];

    console.log('📊 Category data prepared:', {
      categories: categoryData.length,
      totalTopics: categoryData.reduce(
        (sum, cat) => sum + cat.topics.length,
        0,
      ),
    });

    console.log('🏷️ Creating hashtags in parallel...');
    const hashtagResults = await this.createHashtagsInParallel(categoryData);
    console.log('✅ Hashtag creation completed:', {
      created: hashtagResults.created,
      skipped: hashtagResults.skipped,
    });

    console.log('📝 Creating crosswords in batches (2 per topic)...');
    const crosswordResults = await this.createCrosswordsInBatches(
      categoryData,
      hashtagResults.hashtagMap,
      2,
    );
    console.log('✅ Crossword creation completed:', {
      created: crosswordResults.created,
      failed: crosswordResults.failed,
    });

    const result = {
      message: `Generation completed. Hashtags: ${hashtagResults.created} created, ${hashtagResults.skipped} skipped. Crosswords: ${crosswordResults.created} created, ${crosswordResults.failed} failed.`,
      hashtagsCreated: hashtagResults.created,
      hashtagsSkipped: hashtagResults.skipped,
      crosswordsCreated: crosswordResults.created,
      crosswordsFailed: crosswordResults.failed,
    };

    console.log('🎉 OpenAI generation process completed successfully!', result);
    return result;
  }

  private async generateCrosswordFromTopic(
    topic: string,
    crosswordNumber: number = 1,
  ): Promise<CreateCrosswordDto | null> {
    console.log(
      `🎯 Generating crossword for topic: "${topic}" (#${crosswordNumber})`,
    );

    const systemPrompt = `You are a crossword puzzle generator. Generate a valid JSON response for a crossword puzzle about "${topic}".

REQUIRED JSON FORMAT:
{
  "title": "Crossword Title",
  "description": "Brief description of the crossword",
  "words": [
    {"word": "WORD1", "clue": "Clue for word 1"},
    {"word": "WORD2", "clue": "Clue for word 2"}
  ]
}

RULES:
- Generate exactly 7-10 words
- Each word should be 3-12 characters long
- Provide concise, clear clues
- Return ONLY the JSON object, no additional text
- Ensure all words are related to the topic "${topic}"
- Make sure the JSON is valid and parseable`;

    const userPrompt = `Create crossword about "${topic}" (#${crosswordNumber}).`;

    console.log(`📤 Sending request to OpenAI for topic: "${topic}"`);
    console.log(`📝 System prompt: ${systemPrompt.substring(0, 100)}...`);
    console.log(`💬 User prompt: ${userPrompt}`);

    try {
      const response = await this.openaiService.generateResponse(userPrompt, {
        systemPrompt,
      });

      console.log(`📥 Received response from OpenAI for topic: "${topic}"`);
      console.log(
        `📄 Response content length: ${response.content.length} characters`,
      );

      console.log(`🔍 Raw response content:`, response.content);

      // Try to extract JSON from the response (in case it's wrapped in markdown)
      let jsonContent = response.content.trim();

      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      console.log(`🔧 Cleaned JSON content:`, jsonContent);

      const crosswordData = JSON.parse(jsonContent);
      console.log(`📊 Parsed crossword data:`, crosswordData);

      // Validate the response structure
      if (!crosswordData || typeof crosswordData !== 'object') {
        throw new Error('Invalid response: not an object');
      }

      if (!crosswordData.title) {
        throw new Error('Invalid response: missing title');
      }

      if (!crosswordData.words || !Array.isArray(crosswordData.words)) {
        throw new Error('Invalid response: missing or invalid words array');
      }

      if (crosswordData.words.length === 0) {
        throw new Error('Invalid response: empty words array');
      }

      console.log(
        `✅ Successfully parsed crossword data for topic: "${topic}"`,
        {
          title: crosswordData.title,
          wordCount: crosswordData.words.length,
          description: crosswordData.description,
        },
      );

      const result = {
        title: crosswordData.title,
        description: crosswordData.description || `Crossword about ${topic}`,
        words: crosswordData.words,
        size: crosswordData.words.length,
        difficulty: DifficultyLevel.Easy,
        cid: Math.floor(Math.random() * 100000),
        isActive: true,
      };

      console.log(
        `🎉 Successfully generated crossword for topic: "${topic}" (#${crosswordNumber})`,
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to generate crossword for topic: "${topic}" (#${crosswordNumber})`,
        error,
      );
      return null;
    }
  }

  private async createHashtagsInParallel(
    categoryData: Array<{ category: string; topics: string[] }>,
  ) {
    console.log(
      `🏷️ Starting hashtag creation for ${categoryData.length} categories`,
    );

    const hashtagPromises = categoryData.map(async ({ category }) => {
      console.log(`🔍 Processing hashtag for category: "${category}"`);
      const slug = generateSlug(category);
      console.log(`📝 Generated slug: "${slug}"`);

      const existingHashtag = await this.hashtagService.findOne({ slug });
      if (!existingHashtag) {
        console.log(`➕ Creating new hashtag for category: "${category}"`);
        const hashtag = await this.hashtagService.create({
          name: category,
          slug: slug,
          description: category,
          isActive: true,
          createdBy: CreatedByType.Admin,
        });
        console.log(
          `✅ Created hashtag for category: "${category}" with ID: ${hashtag._id.toString()}`,
        );
        return { category, hashtag, created: true };
      }

      console.log(
        `⏭️ Skipping existing hashtag for category: "${category}" with ID: ${existingHashtag._id.toString()}`,
      );
      return { category, hashtag: existingHashtag, created: false };
    });

    console.log(`⏳ Waiting for all hashtag operations to complete...`);
    const results = await Promise.all(hashtagPromises);
    const hashtagMap = new Map();
    let created = 0;
    let skipped = 0;

    results.forEach(({ category, hashtag, created: wasCreated }) => {
      hashtagMap.set(category, hashtag);
      if (wasCreated) created++;
      else skipped++;
    });

    console.log(`🏷️ Hashtag creation summary:`, {
      total: categoryData.length,
      created,
      skipped,
    });

    return { hashtagMap, created, skipped };
  }

  private async createCrosswordsInBatches(
    categoryData: Array<{ category: string; topics: string[] }>,
    hashtagMap: Map<string, Types.ObjectId>,
    crosswordsPerTopic: number = 2,
    batchSize: number = 10,
  ) {
    console.log(`📝 Starting crossword batch creation process...`);
    console.log(`📊 Batch parameters:`, {
      crosswordsPerTopic,
      batchSize,
      categories: categoryData.length,
    });

    const allTasks: Array<{
      topic: string;
      category: string;
      hashtag: Types.ObjectId;
      crosswordNumber: number;
    }> = [];

    categoryData.forEach(({ category, topics }) => {
      const hashtag = hashtagMap.get(category);
      if (hashtag) {
        console.log(
          `📋 Processing category: "${category}" with ${topics.length} topics`,
        );
        topics.forEach((topic) => {
          for (let i = 1; i <= crosswordsPerTopic; i++) {
            allTasks.push({ topic, category, hashtag, crosswordNumber: i });
          }
        });
      } else {
        console.warn(`⚠️ No hashtag found for category: "${category}"`);
      }
    });

    let created = 0;
    let failed = 0;
    const totalTasks = allTasks.length;

    console.log(`📊 Task summary:`, {
      totalTasks,
      batchSize,
      totalBatches: Math.ceil(totalTasks / batchSize),
    });

    for (let i = 0; i < allTasks.length; i += batchSize) {
      const batch = allTasks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allTasks.length / batchSize);

      console.log(
        `🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} crosswords)`,
      );
      console.log(
        `📋 Batch tasks:`,
        batch.map((task) => `${task.topic} (#${task.crosswordNumber})`),
      );

      const batchPromises = batch.map(
        async ({ topic, hashtag, crosswordNumber }) => {
          try {
            console.log(
              `🎯 Starting crossword generation for: "${topic}" (#${crosswordNumber})`,
            );
            const crosswordData = await this.generateCrosswordFromTopic(
              topic,
              crosswordNumber,
            );
            if (!crosswordData) {
              console.log(
                `❌ Failed to generate data for: "${topic}" (#${crosswordNumber})`,
              );
              return { success: false };
            }

            console.log(
              `💾 Saving crossword to database: "${topic}" (#${crosswordNumber})`,
            );
            await this.createCrossword(
              {
                ...crosswordData,
                hashtags: [hashtag._id.toString()],
                size: crosswordData.size,
                difficulty: crosswordData.difficulty,
              },
              CreatedByType.Admin,
            );
            console.log(
              `✅ Successfully saved crossword: "${topic}" (#${crosswordNumber})`,
            );
            return { success: true };
          } catch (error) {
            console.error(
              `❌ Error processing crossword: "${topic}" (#${crosswordNumber})`,
              error,
            );
            return { success: false };
          }
        },
      );

      console.log(`⏳ Waiting for batch ${batchNumber} to complete...`);
      const batchResults = await Promise.all(batchPromises);
      let batchCreated = 0;
      let batchFailed = 0;

      batchResults.forEach((result) => {
        if (result.success) {
          created++;
          batchCreated++;
        } else {
          failed++;
          batchFailed++;
        }
      });

      console.log(`✅ Batch ${batchNumber} completed:`, {
        created: batchCreated,
        failed: batchFailed,
        totalProgress: `${created + failed}/${totalTasks}`,
        percentage: Math.round(((created + failed) / totalTasks) * 100),
      });

      if (batchNumber < totalBatches) {
        console.log(`⏸️ Waiting 1 second before next batch...`);
        await this.delay(1000);
      }
    }

    console.log(
      `Generation completed: ${created} crosswords created, ${failed} failed`,
    );
    return { created, failed };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
