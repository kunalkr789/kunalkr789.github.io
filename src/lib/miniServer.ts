/**
 * A tiny Express-style router that runs entirely in the browser.
 * It powers the API playground, so the backend side of the portfolio
 * is real, testable code rather than a screenshot.
 */
export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface Req {
  method: Method;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
}

export interface Res {
  status(code: number): Res;
  set(name: string, value: string): Res;
  json(data: unknown): void;
}

export type Handler = (req: Req, res: Res) => void | Promise<void>;
export type Middleware = (req: Req, res: Res, next: () => Promise<void>) => void | Promise<void>;

export interface Response {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  ms: number;
}

interface Route {
  method: Method;
  pattern: string;
  regex: RegExp;
  keys: string[];
  handler: Handler;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

function compile(pattern: string) {
  const keys: string[] = [];
  const src = pattern.replace(/\//g, '\\/').replace(/:(\w+)/g, (_, k: string) => {
    keys.push(k);
    return '([^/]+)';
  });
  return { regex: new RegExp(`^${src}\\/?$`), keys };
}

export function createServer() {
  const routes: Route[] = [];
  const middleware: Middleware[] = [];

  const add = (method: Method) => (pattern: string, handler: Handler) => {
    routes.push({ method, pattern, handler, ...compile(pattern) });
  };

  async function request(method: Method, url: string, body?: unknown): Promise<Response> {
    const started = performance.now();
    const u = new URL(url, 'https://api.local');
    let status = 200;
    let payload: unknown = null;
    const headers: Record<string, string> = { 'content-type': 'application/json; charset=utf-8' };

    const res: Res = {
      status(code) {
        status = code;
        return res;
      },
      set(name, value) {
        headers[name.toLowerCase()] = value;
        return res;
      },
      json(data) {
        payload = data;
      },
    };

    const req: Req = { method, path: u.pathname, params: {}, query: u.searchParams, body };

    const dispatch = async () => {
      const pathMatches = routes.filter((r) => r.regex.test(u.pathname));
      const route = pathMatches.find((r) => r.method === method);
      if (!route) {
        if (pathMatches.length) {
          res.set('allow', [...new Set(pathMatches.map((r) => r.method))].join(', '));
          throw new HttpError(405, `Method ${method} not allowed on ${u.pathname}`);
        }
        throw new HttpError(404, `No route for ${method} ${u.pathname}`);
      }
      const m = route.regex.exec(u.pathname)!;
      route.keys.forEach((k, i) => (req.params[k] = decodeURIComponent(m[i + 1])));
      await route.handler(req, res);
    };

    const run = async (i: number): Promise<void> => {
      if (i < middleware.length) await middleware[i](req, res, () => run(i + 1));
      else await dispatch();
    };

    try {
      await run(0);
    } catch (err) {
      if (err instanceof HttpError) {
        status = err.status;
        payload = { error: { status: err.status, message: err.message, details: err.details } };
      } else {
        status = 500;
        payload = { error: { status: 500, message: 'Internal server error' } };
      }
    }

    headers['x-response-time'] = `${(performance.now() - started).toFixed(2)}ms`;
    return { status, headers, body: payload, ms: performance.now() - started };
  }

  return {
    get: add('GET'),
    post: add('POST'),
    patch: add('PATCH'),
    delete: add('DELETE'),
    use: (mw: Middleware) => middleware.push(mw),
    routes: () => routes.map(({ method, pattern }) => ({ method, pattern })),
    request,
  };
}

export type Server = ReturnType<typeof createServer>;
