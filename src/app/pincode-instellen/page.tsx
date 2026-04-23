import { redirect } from "next/navigation";
import { getParentSession } from "@/lib/parentSession";
import PincodeInstellenForm from "./PincodeInstellenForm";

export default async function PincodeInstellenPage() {
  const parent = await getParentSession();
  if (!parent) redirect("/inloggen");
  if (!parent.pincode_is_tijdelijk) redirect("/mijn");

  return <PincodeInstellenForm />;
}
