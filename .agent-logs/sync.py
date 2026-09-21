import os
import json
import re
import sys
from datetime import datetime

def parse_transcript(transcript_path, session_id, author="bavis", project="AmazonClone", model_name="gemini-3.6-flash", tool_name="antigravity"):
    if not os.path.exists(transcript_path):
        print(f"Transcript not found: {transcript_path}")
        return None

    exchanges = []
    current_prompt = None
    
    with open(transcript_path, 'r', encoding='utf-8') as f:
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
            
            if src == "USER_EXPLICIT" and msg_type == "USER_INPUT":
                # Save previous prompt if there was one pending
                if current_prompt is not None and current_prompt.get("prompt"):
                    exchanges.append(current_prompt)
                
                # Extract prompt content from <USER_REQUEST> if present
                match = re.search(r'<USER_REQUEST>(.*?)</USER_REQUEST>', content, re.DOTALL)
                if match:
                    prompt_text = match.group(1).strip()
                else:
                    prompt_text = content.strip()
                
                current_prompt = {
                    "timestamp": created_at,
                    "prompt": prompt_text,
                    "response": None,
                    "response_timestamp": None
                }
            elif msg_type == "PLANNER_RESPONSE" and current_prompt is not None and content:
                # Clean out thinking tags if any present
                text_content = re.sub(r'<thinking>.*?</thinking>', '', content, flags=re.DOTALL).strip()
                if text_content:
                    # Update response with the latest PLANNER_RESPONSE text content in this turn
                    current_prompt["response"] = text_content
                    current_prompt["response_timestamp"] = created_at

    if current_prompt and current_prompt.get("prompt"):
        exchanges.append(current_prompt)

    if not exchanges:
        print("No exchanges found yet.")
        return None

    first_prompt_time = exchanges[0]["timestamp"]
    last_prompt_time = exchanges[-1]["timestamp"]
    date_str = first_prompt_time.split("T")[0] if "T" in first_prompt_time else datetime.utcnow().strftime("%Y-%m-%d")
    short_session = session_id[:8]
    
    try:
        dt = datetime.strptime(first_prompt_time.replace("Z", "+0000"), "%Y-%m-%dT%H:%M:%S%z")
        time_fn = dt.strftime("%Y-%m-%d_%H-%M-%S")
    except Exception:
        time_fn = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
        
    out_filename = f"{time_fn}_{session_id}.md"
    out_dir = os.path.join(os.getcwd(), ".agent-logs")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, out_filename)
    
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
        lines.append(ex['prompt'])
        lines.append("")
        lines.append("")
        lines.append(f"[LOG_ENTRY type=RESPONSE num={idx} session={short_session}]")
        lines.append(f"timestamp: {ex.get('response_timestamp') or ex['timestamp']}")
        lines.append(f"model: {model_name}")
        lines.append("")
        if ex.get('response'):
            lines.append(ex['response'])
        else:
            lines.append("<PENDING_OR_IN_PROGRESS>")
        lines.append("")
        lines.append("")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Log generated at: {out_path}")
    return out_path

if __name__ == "__main__":
    brain_root = r"C:\Users\bavis\.gemini\antigravity-ide\brain"
    active_id = "51531d7c-42e8-4803-b06c-d00adf923a4e"

    if len(sys.argv) > 1:
        sessions_to_sync = [sys.argv[1]]
    else:
        sessions_to_sync = [active_id]
        if os.path.exists(brain_root):
            try:
                dirs = [
                    d for d in os.listdir(brain_root)
                    if os.path.isdir(os.path.join(brain_root, d))
                    and os.path.exists(os.path.join(brain_root, d, ".system_generated", "logs", "transcript_full.jsonl"))
                ]
                # Sort by modification time descending
                dirs.sort(
                    key=lambda d: os.path.getmtime(os.path.join(brain_root, d, ".system_generated", "logs", "transcript_full.jsonl")),
                    reverse=True
                )
                if dirs:
                    sessions_to_sync = dirs[:2]
            except Exception as e:
                print(f"Could not list brain directory: {e}")

    for s_id in sessions_to_sync:
        t_path = os.path.join(brain_root, s_id, ".system_generated", "logs", "transcript_full.jsonl")
        if os.path.exists(t_path):
            parse_transcript(t_path, s_id)
        else:
            print(f"Transcript not found for session {s_id}: {t_path}")

