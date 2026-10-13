"use client";

import { useCallback, useState } from "react";
import { Builder } from "@/components/builder";
import { Detail } from "@/components/detail";
import { Gate } from "@/components/gate";
import { Audience, Compare, Lineup, TabBar, TopBar, type Tab } from "@/components/report";
import { Trace } from "@/components/trace";
import { blankRequest, demoRequest, getLineup, type LineupRequest, type LineupResult } from "@/lib/lineup";

type Phase = "gate" | "builder" | "running" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [request, setRequest] = useState<LineupRequest>(blankRequest);
  const [result, setResult] = useState<LineupResult | null>(null);
  const [tab, setTab] = useState<Tab>("lineup");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isExample, setIsExample] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [pulseDone, setPulseDone] = useState(false);

  const run = useCallback(
    async (r: LineupRequest) => {
    setRequest(r);
    setGuideOpen(isExample);
    setPulseDone(false);
    setIsExample(false);
    setResult(await getLineup(r));
    setTab("lineup");
    setPhase("running");
    },
    [isExample],
  );
  const finish = useCallback(() => setPhase("done"), []);

  if (phase === "gate") {
    return (
      <Gate
        onDemo={() => {
          setRequest(demoRequest);
          setIsExample(true);
          setPhase("builder");
        }}
        onCustom={() => {
          setRequest(blankRequest);
          setIsExample(false);
          setPhase("builder");
        }}
      />
    );
  }
  if (phase === "builder") {
    return <Builder initial={request} example={isExample} onRun={run} onBack={() => setPhase("gate")} />;
  }
  if (!result) return null;
  if (phase === "running") return <Trace steps={result.steps} onDone={finish} />;

  return (
    <div className="app-pad mx-auto min-h-screen max-w-2xl">
      <TopBar onRerun={() => setPhase("builder")} />
      <main>
        {tab === "lineup" && (
          <Lineup
            result={result}
            guided={guideOpen}
            pulse={guideOpen && !pulseDone}
            onDismissGuide={() => setGuideOpen(false)}
            onOpen={(id) => {
              setPulseDone(true);
              setOpenId(id);
            }}
          />
        )}
        {tab === "compare" && <Compare result={result} onOpen={setOpenId} />}
        {tab === "audience" && <Audience result={result} />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      {openId && <Detail order={result.candidates} id={openId} guided={guideOpen} onChange={setOpenId} />}
    </div>
  );
}
