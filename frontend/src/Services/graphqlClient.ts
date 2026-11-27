import { getApiUrl, getHeaders } from './apiHelpers';

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlQuery<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  auth: boolean = false
): Promise<T> {
  const url = `${getApiUrl()}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...getHeaders(auth),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'GraphQL request failed');
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map(e => e.message).join(', '));
  }

  return json.data;
}

export const GRAPHQL_ADMIN = '/graphql';
export const GRAPHQL_PUBLIC = '/graphql';
