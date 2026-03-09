import { Router } from "express";

const router = Router();

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python:     71,
  cpp:        54,
  java:       62,
};

router.post("/", async (req, res) => {
  const { code, language } = req.body;
  const langId = LANGUAGE_IDS[language];

  if (!langId) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  try {
    const submitRes = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
          stdin: "",
        }),
      }
    );

    const data = await submitRes.json() as any;
    const output = data.stdout || "";
    const stderr = data.stderr || data.compile_output || "";
    const exitCode = data.status?.id === 3 ? 0 : 1;

    res.json({ output, stderr, exitCode });
  } catch (err) {
    console.error("Execution error:", err);
    res.status(500).json({ error: "Execution failed" });
  }
});

export default router;