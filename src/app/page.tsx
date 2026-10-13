"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Builder } from "@/components/builder";
import { Detail } from "@/components/detail";
import { Gate } from "@/components/gate";
import { Audience, Compare, Lineup, TabBar, TopBar, type Tab } from "@/components/report";
import { Trace } from "@/components/trace";
import { blankRequest, demoRequest, getLineup, type LineupRequest, type LineupResult } from "@/lib/lineup";

type Phase = "gate" | "builder" | "running" | "done";
type Nav = { phase: Phase; openId: string | null };

export default function Home() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [request, setRequest] = useState<LineupRequest>(blankRequest);
  const [result, setResult] = useState<LineupResult | null>(null);
  const [tab, setTab] = useState<Tab>("lineup");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isExample, setIsExample] = useState(false);
  const [fromExample, setFromExample] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [pulseDone, setPulseDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<LineupResult | null>(null);

  const apply = useCallback((n: Nav) => {
    setPhase(n.phase);
    setOpenId(n.openId);
  }, []);
  const push = useCallback(
    (n: Nav) => {
      window.history.pushState(n, "");
      apply(n);
    },
    [apply],
  );
  const replace = useCallback(
    (n: Nav) => {
      window.history.replaceState(n, "");
      apply(n);
    },
    [apply],
  );

  // Make the browser Back/Forward buttons step through the app instead of leaving it.
  useEffect(() => {
    window.history.replaceState({ phase: "gate", openId: null } satisfies Nav, "");
    const onPop = (e: PopStateEvent) => {
      const n = e.state as Nav | null;
      if (!n) return apply({ phase: "gate", openId: null });
      let next = n.phase;
      if ((next === "running" || next === "done") && !resultRef.current) next = "gate";
      if (next === "running") next = "done";
      apply({ phase: next, openId: next === "done" ? n.openId : null });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [apply]);

  // Slow call (~5-15s): fills the fame-vs-fit panel in after the lineup is already on screen.
  const addGeneric = useCallback(async (res: LineupResult) => {
    try {
      const names = (kind: string) => res.candidates.filter((c) => c.kind === kind).map((c) => c.name);
      const r = await fetch("/api/generic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: res.request.seeds.map((s) => s.name),
          headliners: names("headliner"),
          sponsors: names("sponsor"),
        }),
      });
      if (!r.ok) return;
      const { scores } = (await r.json()) as { scores: Record<string, { score: number; line: string }> };
      const merged: LineupResult = {
        ...res,
        candidates: res.candidates.map((c) => ({ ...c, generic: scores[c.name.toLowerCase()] ?? c.generic })),
      };
      if (resultRef.current === res) {
        resultRef.current = merged;
        setResult(merged);
      }
    } catch {}
  }, []);

  const run = useCallback(
    async (r: LineupRequest) => {
      setRequest(r);
      setError(null);
      try {
        const res = await getLineup(r);
        resultRef.current = res;
        setResult(res);
        if (res.source === "qloo") void addGeneric(res);
        setFromExample(isExample);
        setGuideOpen(isExample);
        setPulseDone(false);
        setIsExample(false);
        setTab("lineup");
        push({ phase: "running", openId: null });
      } catch {
        setError("Something went wrong while ranking your lineup. Please try again.");
      }
    },
    [isExample, push, addGeneric],
  );
  const finish = useCallback(() => replace({ phase: "done", openId: null }), [replace]);

  const openCandidate = (id: string) => {
    setPulseDone(true);
    push({ phase: "done", openId: id });
  };
  const changeCandidate = (id: string | null) => {
    if (id) return replace({ phase: "done", openId: id });
    if ((window.history.state as Nav | null)?.openId) window.history.back();
    else apply({ phase: "done", openId: null });
  };
  const goHome = () => {
    setIsExample(false);
    push({ phase: "gate", openId: null });
  };
  const planOwn = () => {
    setRequest(blankRequest);
    setIsExample(false);
    push({ phase: "builder", openId: null });
  };

  if (phase === "gate") {
    return (
      <div key="gate" className="screen">
      <Gate
        onDemo={() => {
          setRequest(demoRequest);
          setIsExample(true);
          push({ phase: "builder", openId: null });
        }}
        onCustom={planOwn}
      />
      </div>
    );
  }
  if (phase === "builder") {
    return (
      <div key="builder" className="screen">
      <Builder
        initial={request}
        example={isExample}
        error={error}
        onRun={run}
        onHome={goHome}
        onBack={() => (window.history.state ? window.history.back() : apply({ phase: "gate", openId: null }))}
      />
      </div>
    );
  }
  if (!result) return null;
  if (phase === "running") {
    const summary = `${result.candidates.length} candidates ranked against ${result.request.seeds.length} audience favourites.`;
    return <Trace steps={result.steps} summary={summary} live={result.source === "qloo"} onDone={finish} />;
  }

  return (
    <div key="results" className="screen app-pad mx-auto min-h-screen max-w-2xl">
      <TopBar onRerun={() => push({ phase: "builder", openId: null })} onHome={goHome} live={result?.source === "qloo"} />
      <main>
        {tab === "lineup" && (
          <Lineup
            result={result}
            guided={guideOpen}
            pulse={guideOpen && !pulseDone}
            showTryOwn={fromExample}
            onTryOwn={planOwn}
            onDismissGuide={() => setGuideOpen(false)}
            onOpen={openCandidate}
          />
        )}
        {tab === "compare" && <Compare result={result} onOpen={openCandidate} />}
        {tab === "audience" && <Audience result={result} />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      {openId && <Detail order={result.candidates} id={openId} guided={guideOpen} live={result.source === "qloo"} onChange={changeCandidate} />}
    </div>
  );
}
