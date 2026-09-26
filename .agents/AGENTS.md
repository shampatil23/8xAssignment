# Agent Capture & Logging Rule

## System Capture Mechanism
- **Tool**: Antigravity IDE (Google DeepMind Agentic Coding Assistant)
- **Native Transcripts Location**: `C:\Users\bavis\.gemini\antigravity-ide\brain\<session-id>\.system_generated\logs\transcript_full.jsonl`
- **Capture Log Sync Script**: `.agent-logs/sync.py`
- **Lifecycle Hooks**: `.agents/hooks.json` (configured on `Stop` and `PostInvocation`)

## Automated Execution Rule
Antigravity automatically logs every user prompt, system event, model thinking, and final response to `transcript_full.jsonl`.
At every turn completion and agent stop, the lifecycle hook in `.agents/hooks.json` executes `.agent-logs/sync.py` to parse `transcript_full.jsonl` and format it into `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md` matching the 8x Assignment specification.
The agent continuously maintains synchronized session logs in `.agent-logs/` across all chats and development sessions.
