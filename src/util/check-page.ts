import { ProblemDocument } from '@mountainpass/problem-document'
import { HandlerResponse } from '../waycharter'
import { ParsedQs } from 'qs'
/**
 * @param page
 */
export function checkPage(
  page: string | ParsedQs | string[] | ParsedQs[] | undefined
): { page?: string } | { pageValidationError: HandlerResponse<ProblemDocument> } {
  return typeof page === 'string' || typeof page === 'undefined' ? { page } : {
    pageValidationError: {
      status: 400,
      body: new ProblemDocument({
        type: 'https://waycharter.io/bad-page',
        title: "Bad Page",
        detail: `We don't understand what page '${page}' is that you are trying to retrieve`,
        page
      }),
      headers: {
        'content-type': 'application/problem+json'
      }
    }
  };
}
