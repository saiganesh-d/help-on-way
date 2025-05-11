import { useState, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* --------------------------------------------------
   Demo data – replace with real API results
-------------------------------------------------- */
const demoProjects = [
  {
    id: "p1",
    name: "ADAS Platform",
    branches: [
      {
        id: "b1",
        name: "Europe",
        components: [
          { id: "c1", name: "ADAS_ECU" },
          { id: "c2", name: "Camera_ECU" },
        ],
        latestRelease: {
          version: "v23.4",
          date: "2025-03-12",
          cveStats: { Critical: 3, High: 6, Medium: 12, Low: 8 },
        },
        ticketStats: { jira: 8, starc: 2 },
      },
      {
        id: "b2",
        name: "China",
        components: [{ id: "c3", name: "ADAS_ECU" }],
        latestRelease: {
          version: "v23.3",
          date: "2025-02-28",
          cveStats: { Critical: 1, High: 4, Medium: 9, Low: 5 },
        },
        ticketStats: { jira: 3, starc: 1 },
      },
    ],
  },
  // Add more projects …
];

export default function ProjectDashboard() {
  const [projectId, setProjectId] = useState(demoProjects[0].id);
  const project = demoProjects.find((p) => p.id === projectId)!;
  const defaultBranch = project.branches[0];
  const [branchId, setBranchId] = useState(defaultBranch.id);
  const branch = project.branches.find((b) => b.id === branchId)!;

  /* Build stacked‑bar dataset: one object per branch */
  const stackedData = useMemo(
    () =>
      project.branches.map((b) => ({
        branch: b.name,
        ...b.latestRelease.cveStats,
      })),
    [project]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col gap-4">
      {/* Top nav (≈10%) */}
      <header className="flex items-center justify-between py-3 px-6 rounded-xl bg-white shadow-md">
        <h1 className="text-2xl font-semibold">CVE / Release Dashboard</h1>
        <Select value={projectId} onValueChange={(val) => setProjectId(val)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {demoProjects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-4 flex-1">
        {/* Left column (≈30%) */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Stacked Severity Chart */}
          <Card className="flex-1">
            <CardContent className="p-4 h-full">
              <h2 className="text-lg font-semibold mb-2">CVEs by Severity – all branches</h2>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Critical" stackId="sev" fill="#000000" />
                  <Bar dataKey="High" stackId="sev" fill="#FF0000" />
                  <Bar dataKey="Medium" stackId="sev" fill="#FFA500" />
                  <Bar dataKey="Low" stackId="sev" fill="#008000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Branch nav tabs */}
          <Tabs value={branchId} onValueChange={setBranchId} className="w-full">
            <TabsList className="w-full overflow-x-auto whitespace-nowrap">
              {project.branches.map((b) => (
                <TabsTrigger key={b.id} value={b.id} className="px-4 py-2">
                  {b.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {project.branches.map((b) => (
              <TabsContent key={b.id} value={b.id}>
                <div className="mt-2 text-sm leading-6">
                  <p>
                    <strong>Latest Release:</strong> {b.latestRelease.version} ({b.latestRelease.date})
                  </p>
                  <p>
                    <strong>Total CVEs:</strong>{" "}
                    {Object.values(b.latestRelease.cveStats).reduce((s, n) => s + n, 0)}
                  </p>
                  <p>
                    <strong>Components:</strong> {b.components.map((c) => c.name).join(", ")}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right column (≈70%) */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr className="text-left">
                    <th className="p-3">Project / Branch</th>
                    <th className="p-3">Latest Release</th>
                    <th className="p-3">Release Date</th>
                    <th className="p-3">Runs</th>
                    <th className="p-3">CVEs</th>
                    <th className="p-3">Tickets</th>
                    <th className="p-3">SBOM</th>
                    <th className="p-3">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {demoProjects.map((proj) => (
                    <>
                      <tr key={proj.id} className="bg-white font-medium border-t">
                        <td className="p-3" colSpan={8}>{proj.name}</td>
                      </tr>
                      {proj.branches.map((br) => (
                        br.components.map((comp) => (
                          <tr key={`${proj.id}-${br.id}-${comp.id}`} className="border-t">
                            <td className="p-3 pl-6">
                              {br.name} <sup className="text-xs text-gray-500">{comp.name}</sup>
                            </td>
                            <td className="p-3">{br.latestRelease.version}</td>
                            <td className="p-3">{br.latestRelease.date}</td>
                            <td className="p-3">
                              <Button variant="outline" size="sm">Runs</Button>
                            </td>
                            <td className="p-3">
                              {
                                Object.values(br.latestRelease.cveStats).reduce(
                                  (s, n) => s + n,
                                  0
                                )
                              }
                              <Button variant="outline" size="sm" className="ml-2">CVEs</Button>
                            </td>
                            <td className="p-3">
                              {br.ticketStats.jira + br.ticketStats.starc}
                              <Button variant="outline" size="sm" className="ml-2">Tickets</Button>
                            </td>
                            <td className="p-3">
                              <Button variant="outline" size="sm">SBOM</Button>
                            </td>
                            <td className="p-3">
                              <Button variant="outline" size="sm">Report</Button>
                            </td>
                          </tr>
                        ))
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
