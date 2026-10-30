import urllib.request
import re

url = "https://auvare-store.vercel.app/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

print("HTML status: 200 OK")
chunks = list(set(re.findall(r"/_next/static/chunks/[^\"]+\.js", html)))
print(f"Total chunks referenced: {len(chunks)}")

found_tk = False
found_actions = False

for chunk in chunks:
    chunk_url = "https://auvare-store.vercel.app" + chunk
    try:
        with urllib.request.urlopen(urllib.request.Request(chunk_url, headers={"User-Agent": "Mozilla/5.0"})) as c_resp:
            c_text = c_resp.read().decode("utf-8", errors="ignore")
            if "TK " in c_text:
                found_tk = True
                print(f"[VERIFIED] Found 'TK ' in chunk: {chunk}")
            if "Inspect" in c_text and "Drop Claimed" in c_text:
                found_actions = True
                print(f"[VERIFIED] Found card action 'Inspect' and 'Drop Claimed' in chunk: {chunk}")
    except Exception as e:
        print(f"Error reading chunk {chunk}: {e}")

print("FINAL VERIFICATION RESULT:", {"TK_Currency_Live": found_tk, "Card_Actions_Live": found_actions})

