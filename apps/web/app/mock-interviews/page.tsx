export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

export default function MockInterviewsPage() {
  redirect("/interview/new");
}
