import LabShell from "@/components/labs/LabShell";
import Workspace from "@/components/labs/Workspace";
export const metadata = {
  title: "Your Build Lab workspace | AIxDesign",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <LabShell>
      <Workspace />
    </LabShell>
  );
}
