// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** doThumb POST /api/appThumb/ */
export async function doThumbUsingPost(
  body: API.AppThumbAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseInt_>("/api/appThumb/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** hasThumbed POST /api/appThumb/hasThumbed */
export async function hasThumbedUsingPost(
  body: API.AppThumbAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppThumbVO_>("/api/appThumb/hasThumbed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
