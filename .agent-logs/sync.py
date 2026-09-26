import os
import json
import re
import sys
from datetime import datetime

# Known session IDs associated with the 8x AmazonClone assignment
KNOWN_8X_SESSIONS = [
    "1153c1cf-5971-4d84-9186-130d5306a624",
    "02d78a3d-c79f-4316-95ef-c5cf7a893144",
    "2ad16e77-2edb-49c9-9f08-8c8d0c6f5f5f",
    "51531d7c-42e8-4803-b06c-d00adf923a4e",
    "f5e41dbe-1968-4ec7-b257-aa64705bfdd7",
    "4f7a7188-5492-4fc7-a944-c539b08b940a",
    "3c2407a8-e998-4eb3-b20e-168a257143d0",
    "1eea34b9-4a9b-439a-8c46-da2b19cd9ad4",
    "a7c9ada0-1511-46fb-8860-7255b918ed0b",
    "c4175d9a-14c4-4a76-b7b6-b1dc0f646bd1"
]

SECRET_PATTERNS = [
    (re.compile(r"gsk_[A-Za-z0-9]{30,}"), "gsk_REDACTED_GROQ_API_KEY"),
    (re.compile(r"Z3cIz5CO9OaGW3AQY9hCqjsBhf8"), "REDACTED_CLOUDINARY_SECRET"),
    (re.compile(r"ghp_[A-Za-z0-9]{30,}"), "ghp_REDACTED_GITHUB_TOKEN"),
]

def redact_secrets(text):
    if not text:
        return text
    for pattern, replacement in SECRET_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def get_log_directories():
    """Returns all directories where .agent-logs should be synchronized."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        script_dir,
        r"c:\Users\bavis\Downloads\8x update\8xAssignment\.agent-logs",
        r"c:\Users\bavis\Downloads\8x update\.agent-logs"
    ]
    cwd = os.getcwd()
    if os.path.basename(cwd) == ".agent-logs":
        candidates.append(cwd)
    else:
        candidates.append(os.path.join(cwd, ".agent-logs"))

    resolved = []
    for c in candidates:
        norm = os.path.normpath(c)
        if norm not in resolved:
            resolved.append(norm)
    return resolved

def detect_model_from_transcript(transcript_path, default_model="gemini-3.6-flash"):
    """Scans transcript for explicit model setting changes or tags."""
    if not os.path.exists(transcript_path):
        return default_model
    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            for line in f:
                if "Model Selection" in line:
                    m = re.search(r"The user changed setting `Model Selection`.*?to ([^.]+)\.", line)
                    if m:
                        model_raw = m.group(1).strip()
                        return model_raw.lower().replace(" ", "-").replace("(", "").replace(")", "")
    except Exception:
        pass
    return default_model

def parse_transcript(transcript_path, session_id, author="bavis", project="AmazonClone", default_model="gemini-3.6-flash", tool_name="antigravity", include_thinking=True):
    if not os.path.exists(transcript_path):
        sys.stderr.write(f"Transcript not found: {transcript_path}\n")
        return None

    model_name = detect_model_from_transcript(transcript_path, default_model)
    exchanges = []
    current_prompt = None

    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
            except Exception:
                continue

            src = data.get("source")
            msg_type = data.get("type")
            created_at = data.get("created_at", "")
            content = data.get("content", "")
            thinking = data.get("thinking", "")

            if src == "USER_EXPLICIT" and msg_type == "USER_INPUT":
                if current_prompt is not None and current_prompt.get("prompt"):
                    exchanges.append(current_prompt)

                match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", content, re.DOTALL)
                if match:
                    prompt_text = match.group(1).strip()
                else:
                    cleaned = re.sub(r"<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>", "", content, flags=re.DOTALL)
                    cleaned = re.sub(r"<USER_SETTINGS_CHANGE>.*?</USER_SETTINGS_CHANGE>", "", cleaned, flags=re.DOTALL)
                    prompt_text = cleaned.strip()

                current_prompt = {
                    "timestamp": created_at,
                    "prompt": prompt_text,
                    "response": None,
                    "response_timestamp": None,
                    "thinking_chunks": []
                }
            elif msg_type == "PLANNER_RESPONSE" and current_prompt is not None:
                # Capture reasoning from thinking field
                if thinking and thinking.strip():
                    th_clean = thinking.strip()
                    if th_clean not in current_prompt["thinking_chunks"]:
                        current_prompt["thinking_chunks"].append(th_clean)

                if content:
                    # Also check for embedded thinking tags in content
                    m_th = re.findall(r"<thinking>(.*?)</thinking>", content, flags=re.DOTALL)
                    for item in m_th:
                        it_clean = item.strip()
                        if it_clean and it_clean not in current_prompt["thinking_chunks"]:
                            current_prompt["thinking_chunks"].append(it_clean)

                    text_content = re.sub(r"<thinking>.*?</thinking>", "", content, flags=re.DOTALL).strip()
                    if text_content:
                        current_prompt["response"] = text_content
                        current_prompt["response_timestamp"] = created_at

    if current_prompt and current_prompt.get("prompt"):
        exchanges.append(current_prompt)

    if not exchanges:
        return None

    first_prompt_time = exchanges[0]["timestamp"]
    last_prompt_time = exchanges[-1]["timestamp"]
    date_str = first_prompt_time.split("T")[0] if "T" in first_prompt_time else datetime.utcnow().strftime("%Y-%m-%d")
    short_session = session_id[:8]

    try:
        clean_time = first_prompt_time.replace("Z", "+0000")
        dt = datetime.strptime(clean_time, "%Y-%m-%dT%H:%M:%S%z")
        time_fn = dt.strftime("%Y-%m-%d_%H-%M-%S")
    except Exception:
        time_fn = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")

    out_filename = f"{time_fn}_{session_id}.md"

    lines = []
    lines.append("---")
    lines.append(f"session_id: {session_id}")
    lines.append(f"date: {date_str}")
    lines.append(f"author: {author}")
    lines.append(f"model: {model_name}")
    lines.append(f"tool: {tool_name}")
    lines.append(f"project: {project}")
    lines.append(f"total_exchanges: {len(exchanges)}")
    lines.append(f"first_prompt_time: {first_prompt_time}")
    lines.append(f"last_prompt_time: {last_prompt_time}")
    lines.append("---")
    lines.append("")
    lines.append(f"# Session Log - {date_str}")
    lines.append("")
    lines.append(f"Session: `{short_session}` | Project: `{project}` | Author: `{author}`")
    lines.append("")
    lines.append("---")
    lines.append("")

    for idx, ex in enumerate(exchanges, 1):
        lines.append(f"[LOG_ENTRY type=PROMPT num={idx} session={short_session}]")
        lines.append(f"timestamp: {ex['timestamp']}")
        lines.append(f"model: {model_name}")
        lines.append("")
        lines.append(ex["prompt"])
        lines.append("")
        lines.append("")
        lines.append(f"[LOG_ENTRY type=RESPONSE num={idx} session={short_session}]")
        lines.append(f"timestamp: {ex.get('response_timestamp') or ex['timestamp']}")
        lines.append(f"model: {model_name}")
        lines.append("")

        # Include thinking if requested and present
        if include_thinking and ex.get("thinking_chunks"):
            lines.append("<thinking>")
            lines.append("\n\n".join(ex["thinking_chunks"]))
            lines.append("</thinking>")
            lines.append("")

        if ex.get("response"):
            lines.append(ex["response"])
        else:
            lines.append("<PENDING_OR_IN_PROGRESS>")
        lines.append("")
        lines.append("")

    content_str = redact_secrets("\n".join(lines))
    written_paths = []

    for out_dir in get_log_directories():
        try:
            os.makedirs(out_dir, exist_ok=True)
            target = os.path.join(out_dir, out_filename)
            with open(target, "w", encoding="utf-8") as f:
                f.write(content_str)
            written_paths.append(target)
        except Exception as e:
            sys.stderr.write(f"Failed to write to {out_dir}: {e}\n")

    return written_paths

def discover_all_sessions(brain_root):
    """Finds all sessions relevant to 8x assignment."""
    if not os.path.exists(brain_root):
        return []

    discovered = list(KNOWN_8X_SESSIONS)
    try:
        dirs = [
            d for d in os.listdir(brain_root)
            if os.path.isdir(os.path.join(brain_root, d))
            and os.path.exists(os.path.join(brain_root, d, ".system_generated", "logs", "transcript_full.jsonl"))
        ]
        dirs.sort(
            key=lambda d: os.path.getmtime(os.path.join(brain_root, d, ".system_generated", "logs", "transcript_full.jsonl")),
            reverse=True
        )
        for d in dirs:
            if d in discovered:
                continue
            t_path = os.path.join(brain_root, d, ".system_generated", "logs", "transcript_full.jsonl")
            try:
                with open(t_path, "r", encoding="utf-8") as f:
                    for _ in range(5):
                        line = f.readline()
                        if not line:
                            break
                        if any(k in line.lower() for k in ["8x", "amazon", "capture test"]):
                            discovered.append(d)
                            break
            except Exception:
                pass
    except Exception as e:
        sys.stderr.write(f"Discovery error: {e}\n")

    return discovered

if __name__ == "__main__":
    brain_root = r"C:\Users\bavis\.gemini\antigravity-ide\brain"
    is_hook = "--hook" in sys.argv

    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if args:
        sessions_to_sync = args
    else:
        sessions_to_sync = discover_all_sessions(brain_root)

    total_synced = 0
    for s_id in sessions_to_sync:
        t_path = os.path.join(brain_root, s_id, ".system_generated", "logs", "transcript_full.jsonl")
        if os.path.exists(t_path):
            paths = parse_transcript(t_path, s_id, include_thinking=True)
            if paths:
                total_synced += 1
                if not is_hook:
                    print(f"Synced session {s_id[:8]} -> {paths[0]}")
        else:
            if not is_hook:
                sys.stderr.write(f"Transcript not found for session {s_id}: {t_path}\n")

    if is_hook:
        print(json.dumps({}))
    else:
        print(f"Log sync completed successfully: {total_synced} sessions synchronized.")
