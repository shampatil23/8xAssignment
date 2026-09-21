// ============================================================================
// Product Q&A Service — Customer Questions and Answers
// ============================================================================
import type { ProductQuestion, QuestionAnswer, ApiResponse } from '@/types';
import {
  getProductQuestions,
  saveProductQuestion,
  addQuestionAnswer,
} from '@/lib/firebase/database';

export async function fetchQuestions(productId: string): Promise<ProductQuestion[]> {
  try {
    return await getProductQuestions(productId);
  } catch (error) {
    console.error('[qaService.fetchQuestions] error:', error);
    return [];
  }
}

export async function submitQuestion(
  userId: string,
  userName: string,
  productId: string,
  questionText: string,
): Promise<ApiResponse<ProductQuestion>> {
  if (!questionText || questionText.trim().length < 5) {
    return {
      success: false,
      error: 'Please enter a valid question (at least 5 characters).',
    };
  }

  try {
    const questionId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newQuestion: ProductQuestion = {
      id: questionId,
      productId,
      userId,
      userName: userName || 'Customer',
      question: questionText.trim(),
      answers: [],
      createdAt: new Date().toISOString(),
    };

    await saveProductQuestion(newQuestion);

    return {
      success: true,
      data: newQuestion,
      message: 'Your question has been posted!',
    };
  } catch (error) {
    console.error('[qaService.submitQuestion] error:', error);
    return {
      success: false,
      error: 'Failed to post question. Please try again.',
    };
  }
}

export async function submitAnswer(
  userId: string,
  authorName: string,
  authorRole: 'customer' | 'seller' | 'admin',
  productId: string,
  questionId: string,
  answerText: string,
): Promise<ApiResponse<QuestionAnswer>> {
  if (!answerText || answerText.trim().length < 3) {
    return {
      success: false,
      error: 'Please enter an answer of at least 3 characters.',
    };
  }

  try {
    const answerId = `ans-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newAnswer: QuestionAnswer = {
      id: answerId,
      text: answerText.trim(),
      authorName: authorName || 'Amazon Customer',
      authorRole,
      createdAt: new Date().toISOString(),
    };

    await addQuestionAnswer(productId, questionId, newAnswer);

    return {
      success: true,
      data: newAnswer,
      message: 'Answer posted successfully!',
    };
  } catch (error) {
    console.error('[qaService.submitAnswer] error:', error);
    return {
      success: false,
      error: 'Failed to post answer.',
    };
  }
}
