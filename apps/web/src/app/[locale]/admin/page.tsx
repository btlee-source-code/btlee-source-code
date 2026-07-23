/**
 * /admin → redirect to /admin/dashboard
 */
import { redirect } from "@/config/navigation";

export default function AdminIndex() {
  redirect({ href: "/admin/dashboard", locale: "ar" });
}
