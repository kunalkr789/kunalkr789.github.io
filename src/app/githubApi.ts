import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  created_at: string;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
}

export interface GhEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { commits?: { message: string }[]; ref_type?: string; action?: string };
}

const HIDDEN = new Set(['test_repo']);

export const githubApi = createApi({
  reducerPath: 'github',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.github.com', headers: { Accept: 'application/vnd.github+json' } }),
  keepUnusedDataFor: 600,
  endpoints: (b) => ({
    repos: b.query<Repo[], string>({
      query: (user) => `/users/${user}/repos?per_page=100&sort=pushed`,
      transformResponse: (rs: Repo[]) => rs.filter((r) => !r.fork && !r.archived && !HIDDEN.has(r.name)),
    }),
    events: b.query<GhEvent[], string>({
      query: (user) => `/users/${user}/events/public?per_page=30`,
      transformResponse: (es: GhEvent[]) => es.filter((e) => !HIDDEN.has(e.repo.name.split('/')[1])),
    }),
  }),
});

export const { useReposQuery, useEventsQuery } = githubApi;
