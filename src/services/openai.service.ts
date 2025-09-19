import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface OpenAIOptions {
  model?: string;
  systemPrompt?: string;
}

export interface OpenAIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;
  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');

    if (!apiKey)
      throw new BadRequestException('OpenAI API key is not configured!');

    this.client = new OpenAI({ apiKey });
    this.defaultModel =
      this.configService.get<string>('openai.model') || 'gpt-4.1-mini';

    console.log(this.defaultModel);
  }

  async generateResponse(
    query: string,
    options: OpenAIOptions = {},
  ): Promise<OpenAIResponse> {
    const { model = this.defaultModel, systemPrompt } = options;
    const input = systemPrompt ? `${systemPrompt}\n\n${query}` : query;
    const requestConfig = {
      model,
      input,
    };

    console.log(`🤖 OpenAI API Request:`, {
      model,
      inputLength: input.length,
      hasSystemPrompt: !!systemPrompt,
    });

    try {
      console.log(`📤 Sending request to OpenAI API...`);
      const response = await this.client.responses.create(requestConfig);

      if (!response) {
        console.error(`❌ No response received from OpenAI API`);
        throw new BadRequestException('No response generated from OpenAI!');
      }

      console.log(`📥 Received response from OpenAI API`);
      const content = this.extractContent(response);
      console.log(`📄 Extracted content length: ${content.length} characters`);

      return { content, usage: undefined };
    } catch (error) {
      console.error(`❌ OpenAI API Error:`, error);
      this.handleError(error);
    }
  }

  private extractContent(response: unknown): string {
    if (typeof response === 'string') return response;

    const responseObj = response as {
      content?: string;
      output_text?: string;
      text?: string;
    };

    // Try different possible content fields
    if (responseObj.output_text) {
      console.log(`🔍 Found content in output_text field`);
      return responseObj.output_text;
    }

    if (responseObj.content) {
      console.log(`🔍 Found content in content field`);
      return responseObj.content;
    }

    if (responseObj.text) {
      console.log(`🔍 Found content in text field`);
      return responseObj.text;
    }

    console.log(`⚠️ No content field found, using full response as string`);
    return JSON.stringify(response);
  }

  private handleError(error: unknown): never {
    if (error instanceof OpenAI.APIError) {
      throw new BadRequestException(`OpenAI API Error: ${error.message}`);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new BadRequestException(`Failed to generate response: ${message}`);
  }
}
