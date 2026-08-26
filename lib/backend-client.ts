
// هذا Axios خاص بالسيرفر فقط، ويستخدمه Route Handler للاتصال بالباك الحقيقي.
import "server-only"; //بيمنع استيراد الملف داخل كود المتصفح

import axios from "axios";

const backendApiUrl = process.env.BACKEND_API_URL;

if (!backendApiUrl) {
  throw new Error("BACKEND_API_URL is not configured");
}

export const backendClient = axios.create({
  baseURL: backendApiUrl,
  timeout: 10000,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});