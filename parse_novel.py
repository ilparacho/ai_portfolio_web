import re
import json

with open("novel_source.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

episodes = []
current_ep = None
current_content = []

for line in lines:
    line = line.rstrip() # keep empty lines for paragraph spacing, just remove trailing
    match = re.match(r'^([0-9]+)화\s*-\s*(.*)$', line)
    if not match:
        match = re.match(r'^([0-9]+)화$', line)
        
    if match:
        if current_ep:
            current_ep["content"] = "\n".join(current_content).strip()
            episodes.append(current_ep)
        
        ep_num = match.group(1)
        title = line
        current_ep = {"id": int(ep_num), "title": title}
        current_content = []
    else:
        if current_ep is not None:
            current_content.append(line)

if current_ep:
    current_ep["content"] = "\n".join(current_content).strip()
    episodes.append(current_ep)

with open("novel_data.js", "w", encoding="utf-8") as f:
    f.write("const novelEpisodes = " + json.dumps(episodes, ensure_ascii=False, indent=2) + ";")
