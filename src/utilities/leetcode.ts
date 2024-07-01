/**
 * Extension lookup table for LeetCode languages.
 */
export const extensionLookup = {
  cpp: "cpp",
  java: "java",
  python: "py",
  python3: "py",
  c: "c",
  csharp: "cs",
  javascript: "js",
  typescript: "ts",
  php: "php",
  swift: "swift",
  kotlin: "kt",
  dart: "dart",
  golang: "go",
  ruby: "rb",
  scala: "scala",
  rust: "rs",
  racket: "rkt",
  erlang: "erl",
  elixir: "ex",
  mysql: "sql",
  mssql: "sql",
  oraclesql: "sql",
  pythondata: "py",
  postgresql: "sql",
};

/**
 * Represents the details of a submission on LeetCode.
 */
interface SubmissionDetails {
  question: {
    title: string;
    questionId: string;
    titleSlug: string;
  };
  totalCorrect: number;
  totalTestcases: number;
  runtimeDisplay: string;
  memoryDisplay: string;
  code: string;
  lang: {
    name: string;
  };
}

/**
 * Retrieves the details of a submission from LeetCode.
 *
 * @param submissionId - The ID of the submission.
 * @returns A Promise that resolves to the submission details.
 * @throws An error if the request fails.
 */
export const fetchSubmissionDetails = async (
  submissionId: number
): Promise<SubmissionDetails> => {
  const response = await fetch("https://leetcode.com/graphql/", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query submissionDetails($submissionId: Int!) {
          submissionDetails(submissionId: $submissionId) {
            question {
              title
              questionId
              titleSlug
            }
            totalCorrect
            totalTestcases
            runtimeDisplay
            memoryDisplay
            code
            lang {
              name
            }
          }
        }
      `,
      variables: { submissionId },
      operationName: "submissionDetails",
    }),
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch submission details for ${submissionId}`);
  }
  const { data } = await response.json();
  return data.submissionDetails;
};

/**
 * Represents the details of a LeetCode question.
 */
interface QuestionDetails {
  topicTags: [
    {
      slug: string;
    }
  ];
}

/**
 * Retrieves the details of a question from LeetCode.
 *
 * @param titleSlug - The slug of the question.
 * @returns A Promise that resolves to the question details.
 * @throws An error if the request fails.
 */
export const fetchQuestionDetails = async (
  titleSlug: string
): Promise<QuestionDetails> => {
  const response = await fetch("https://leetcode.com/graphql/", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query singleQuestionTopicTags($titleSlug: String!) { 
        question(titleSlug: $titleSlug) { 
          topicTags { slug } 
        } 
      }
    `,
      variables: { titleSlug },
      operationName: "singleQuestionTopicTags",
    }),
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch question details for ${titleSlug}`);
  }
  const { data } = await response.json();
  return data.question;
};

/**
 * Represents an item in the progress list on LeetCode.
 */
type ProgressListItem = {
  question: {
    titleSlug: string;
    topicTags: [
      {
        slug: string;
      }
    ];
  };
};

/**
 * Fetches the progress list from LeetCode.
 *
 * @returns A Promise that resolves to an array of progress list items.
 * @throws An error if the progress list fails to fetch.
 */
export const fetchProgressList = async (): Promise<ProgressListItem[]> => {
  const history = [];
  var [pageNo, pageNum, numPerPage] = [1, 1, 50];
  while (pageNo <= pageNum) {
    const response = await fetch("https://leetcode.com/graphql/", {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query progressList($pageNo: Int, $numPerPage: Int, $filters: ProgressListFilterInput) {
            solvedQuestionsInfo(pageNo: $pageNo, numPerPage: $numPerPage, filters: $filters) {
              pageNum
              data {
                question {
                  titleSlug
                  topicTags {
                    slug
                  }
                }
              }
            }
          }
        `,
        variables: {
          pageNo,
          numPerPage,
          filters: {},
        },
        operationName: "progressList",
      }),
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch progress list");
    }
    const { data } = await response.json();
    pageNum = data.solvedQuestionsInfo.pageNum;
    history.push(...data.solvedQuestionsInfo.data);
    pageNo++;
  }
  return history;
};

/**
 * Represents an item in the submission list on LeetCode.
 */
type SubmissionListItem = {
  id: number;
  statusDisplay: string;
  lang: string;
  runtime: string;
  memory: string;
};

/**
 * Fetches the last accepted submission for a question on LeetCode.
 *
 * @param questionSlug - The slug of the question.
 * @returns A Promise that resolves to the last accepted submission.
 * @throws An error if the submission list fails to fetch.
 */
export const fetchLastAccepted = async (
  questionSlug: string
): Promise<SubmissionListItem> => {
  var [offset, limit] = [0, 20];
  var [hasNext, lastKey] = [true, null];
  while (hasNext) {
    const response = await fetch("https://leetcode.com/graphql/", {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query submissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!, $lang: Int, $status: Int) {
            questionSubmissionList(
              offset: $offset
              limit: $limit
              lastKey: $lastKey
              questionSlug: $questionSlug
              lang: $lang
              status: $status
            ) {
              lastKey
              hasNext
              submissions {
                id
                statusDisplay
                lang
                runtime
                memory
              }
            }
          }
        `,
        variables: {
          questionSlug,
          offset,
          limit,
          lastKey,
        },
        operationName: "submissionList",
      }),
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch submission list");
    }
    const { data } = await response.json();
    for (const submission of data.questionSubmissionList.submissions) {
      if (submission.statusDisplay === "Accepted") {
        return submission;
      }
    }
    hasNext = data.questionSubmissionList.hasNext;
    lastKey = data.questionSubmissionList.lastKey;
    offset += data.questionSubmissionList.submissions.length;
  }
};

/**
 * Fetches the entire submission history for a user on LeetCode.
 *
 * Steps:
 * 1. Fetch the entire progress list.
 * 2. For each question in the progress list, fetch its last accepted submission.
 * 3. For each last accepted submission, fetch the submission details.
 * 4. Concatenate all these submission details into an array.
 *
 * @returns A Promise that resolves to an array of submission details.
 * @throws An error if any step in the process fails.
 */
export const fetchAllSubmissionHistory = async (): Promise<
  SubmissionDetails[]
> => {
  const progressList = await fetchProgressList();
  const submissionDetails: SubmissionDetails[] = [];

  // Chunk the progress list into groups of 5
  for (let i = 0; i < progressList.length; i += 5) {
    const chunk = progressList.slice(i, i + 5);

    // Fetch submission details for each question in the chunk
    const submissionDetailsPromises = chunk.map(async (item) => {
      const questionSlug = item.question.titleSlug;
      const lastAccepted = await fetchLastAccepted(questionSlug);
      const details = await fetchSubmissionDetails(lastAccepted.id);
      return details;
    });

    // Wait for all submission details promises to resolve
    const chunkSubmissionDetails = await Promise.all(submissionDetailsPromises);
    submissionDetails.push(...chunkSubmissionDetails);

    console.log(
      `Progress: ${((i + 5) / progressList.length) * 100}% (${i + 5}/${
        progressList.length
      })`
    );

    // Add a delay of 3 seconds before processing the next chunk
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return submissionDetails;
};