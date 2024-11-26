// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** top8AnswerCount GET /api/statistic/answerCount */
export async function top8AnswerCountUsingGet(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListAppAnswerCountDTO_>(
    "/api/statistic/answerCount",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** answerResultCount GET /api/statistic/answerResultCount */
export async function answerResultCountUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.answerResultCountUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListAppAnswerResultDTO_>(
    "/api/statistic/answerResultCount",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}
