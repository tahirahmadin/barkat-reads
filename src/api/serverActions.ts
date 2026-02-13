/**
 * API abstraction layer.
 * Replace mock with axios (or real backend) later – only this file changes.
 */

import { mockData } from '../data/mockData';
import { SubjectItem } from '../types';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface FetchSubjectsResult {
  success: boolean;
  data?: SubjectItem[];
  error?: string;
}

export const fetchSubjects = async (): Promise<FetchSubjectsResult> => {
  try {
    await wait(400);
    return {
      success: true,
      data: mockData,
    };
  } catch (e) {
    return {
      success: false,
      error: 'Failed to fetch content',
    };
  }
};
