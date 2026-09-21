# Agent Capture & Logging Rule

## System Capture Mechanism
- Tool: Antigravity IDE (Google DeepMind Agentic Coding Assistant)
- Transcripts Location: `C:\Users\bavis\.gemini\antigravity-ide\brain\<session-id>\.system_generated\logs\transcript_full.jsonl`
- Capture Log Sync Script: `.agent-logs/sync.py`

## Automated Execution Rule
Antigravity automatically logs every user prompt, system event, model thinking, and final response to `transcript_full.jsonl`.
At every turn completion, the agent executes `.agent-logs/sync.py` to parse `transcript_full.jsonl` and format it into `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md` according to the 8x Assignment specifications.
