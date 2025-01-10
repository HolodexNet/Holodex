type RequestInitWithQuery<APIResponseBodyType> = RequestInit & {
  params?: object;
  handler?: (value: Response) => Promise<APIResponseBodyType>;
};

function toStr(x: unknown): string {
  return typeof x === "object" ? JSON.stringify(x) : String(x);
}

const stringify = (obj: object) => {
  return new URLSearchParams(
    Object.entries(obj).flatMap(([k, v]) =>
      Array.isArray(v)
        ? [[k, v.map(toStr).toString()]]
        : [[k, typeof v === "object" ? JSON.stringify(v) : String(v)]],
    ),
  ).toString();
};

export class HTTPError<T = unknown> extends Error {
  readonly data: T;
  readonly res: Response;
  readonly statusText: string;
  readonly statusCode: number;

  constructor({
    data,
    res,
    message,
  }: {
    data: T;
    res: Response;
    message?: string;
  }) {
    super(message ?? `Oops, request failed with status ${res.status}`);
    this.data = data;
    this.statusText = res.statusText;
    this.statusCode = res.status;
    this.res = res;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = new HTTPError({
      res: response,
      message: response.statusText,
      data: response.body,
    });
    return Promise.reject(err);
  }
  return response.json().then((obj) => {
    const data = obj as T;
    return data;
  });
}

export const createFetchClient = (token?: string | null) => {
  const fetchFn = function <APIResponseBodyType>(
    url: string,
    {
      params,
      headers,
      handler,
      ...opt
    }: RequestInitWithQuery<APIResponseBodyType> | undefined = {},
  ): Promise<APIResponseBodyType> {
    const urlWithQuery = params ? url + "?" + stringify(params) : url;

    const fetchOpt = {
      headers: {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...opt,
    } satisfies RequestInit;

    return fetch(urlWithQuery, fetchOpt).then(
      handler || handleResponse<APIResponseBodyType>,
    );
  };

  // helper functions
  fetchFn.get = <U>(url: string, opt?: RequestInitWithQuery<U>) =>
    fetchFn<U>(url, { method: "GET", ...opt });
  fetchFn.post = <APIResponseBodyType, RequestBodyType>(
    url: string,
    body: RequestBodyType,
    opt?: RequestInitWithQuery<APIResponseBodyType>,
  ) =>
    fetchFn<APIResponseBodyType>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...opt,
    });
  fetchFn.put = <APIResponseBodyType, RequestBodyType>(
    url: string,
    body: RequestBodyType,
    opt?: RequestInitWithQuery<APIResponseBodyType>,
  ) =>
    fetchFn<APIResponseBodyType>(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...opt,
    });
  fetchFn.delete = <APIResponseBodyType>(
    url: string,
    opt?: RequestInitWithQuery<APIResponseBodyType>,
  ) => fetchFn<APIResponseBodyType>(url, { method: "DELETE", ...opt });
  fetchFn.head = (url: string, opt?: RequestInitWithQuery<null>) =>
    fetchFn<null>(url, { method: "HEAD", ...opt });
  fetchFn.patch = <APIResponseBodyType, RequestBodyType>(
    url: string,
    body: RequestBodyType,
    opt?: RequestInitWithQuery<APIResponseBodyType>,
  ) =>
    fetchFn<APIResponseBodyType>(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...opt,
    });

  fetchFn.loggedIn = !!token;

  return fetchFn;
};

export type FetchClient = ReturnType<typeof createFetchClient>;
