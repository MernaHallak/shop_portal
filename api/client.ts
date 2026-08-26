// هذا Axios الخاص بالمتصفح. يعني ملف Axios يلي بتستدعيه من useQuery أو من Client Component. كل طلباته تذهب إلى Route Handlers في Next.js.

import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  // headers: {
  //   "Content-Type": "application/json", //هذا مناسب للطلبات العادية، بس مو مناسب للـ FormData لهيك ما منحط نحنا النوع ومنخلي ال Axios يحدده تلقائياً حسب نوع الـ body
  // },
});