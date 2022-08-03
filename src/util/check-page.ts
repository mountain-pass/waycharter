import { ProblemDocument } from '@mountainpass/problem-document'
import { EmptyHandlerResponse, HandlerResponse } from '../waycharter'

/**
 * @param page
 * @param expandedPath
 */
export function checkPage(
  page: string | import('qs').ParsedQs | string[] | import('qs').ParsedQs[],
  expandedPath: string
): { page: number | string } | { pageValidationError: HandlerResponse<ProblemDocument> } | { redirect: EmptyHandlerResponse } {
  if (page === '0') {
    return {
      redirect: {
        status: 308,
        headers: {
          location: expandedPath
        }
      }
    }
  }

  if (Array.isArray(page)) {
    return {
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
    }
  }
  // page should be >= 0
  const pageInt = Number.parseInt((page as string) || '0')

  if (Number.isNaN(pageInt)) {
    return { page: page as string }
  }
  if (pageInt < 0) {
    return {
      pageValidationError: {
        status: 400,
        body: new ProblemDocument({
          type: 'https://waycharter.io/bad-page',
          title: "Bad Page",
          detail: `You've asked for a negative page '${page}'. We don't know what that means`,
          page
        }),
        headers: {
          'content-type': 'application/problem+json'
        }
      }
    }
  }
  return {
    page: pageInt
  }
}
