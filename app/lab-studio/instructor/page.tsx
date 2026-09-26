import LabShell from "@/components/labs/LabShell";
import Instructor from "@/components/labs/Instructor";
export const metadata = {
  title: "Instructor workspace | Build Lab",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <LabShell>
      <Instructor />
    </LabShell>
  );
}
