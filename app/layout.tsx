import { QueryProvider } from "./query-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <QueryProvider>{children}

{/* فكرتها شبيهة بالـ Provider من ناحية إنها بتنحط مرة واحدة فوق بالتطبيق حتى تكون رسائل الـ toast متاحة بكل مكان. بدون ما تضيفي <Toaster /> بكل صفحة. */}
{/* بس تقنيًا <Toaster /> مو Provider حقيقي؛ هو component مسؤول عن عرض التوستات، بينما:toast.success(...) هو اللي بيطلق الرسالة  */}
{/* بدون  <Toaster /> ما بتنعرض الرسالة */}
           <Toaster
            richColors
            position="top-center"
          />

        </QueryProvider>
      </body>
    </html>
  );
}