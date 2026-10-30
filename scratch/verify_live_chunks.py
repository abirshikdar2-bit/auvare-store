import urllib.request
import re

html = urllib.request.urlopen('https://auvare-store.vercel.app/').read().decode('utf-8')
chunks = re.findall(r'/_next/static/chunks/[^"]+\.js', html)
print(f"Found {len(chunks)} chunks")

found = False
for c in chunks:
    try:
        content = urllib.request.urlopen('https://auvare-store.vercel.app' + c).read().decode('utf-8')
        if 'Suggested Pieces' in content and 'Customer Recently Viewed' in content:
            print("SUCCESS! Verified live chunk contains 'Suggested Pieces' & 'Customer Recently Viewed':", c)
            found = True
            break
    except Exception as e:
        print("Error checking chunk:", e)

if not found:
    print("Warning: not found yet in verified chunks")

