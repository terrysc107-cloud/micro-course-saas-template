export class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
export async function labRequest(path: string, body?: unknown) {
  const response = await fetch(
    `/api/labs/${path}`,
    body === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const data = await response
    .json()
    .catch(() => ({ error: "We could not read the response. Please retry." }));
  if (!response.ok)
    throw new RequestError(
      data.error ?? "We could not complete that step.",
      response.status,
      data.fields,
    );
  return data;
}
