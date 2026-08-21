import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Dropdown Button
content = re.sub(
    r'(\? "bg-\[#1e293b\]/80 backdrop-blur-sm border-slate-700/50 text-slate-200 hover:bg-slate-800"\n\s*: ")bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md"',
    r'\1bg-indigo-50/80 backdrop-blur-sm border-indigo-200/60 text-indigo-900 hover:bg-indigo-100 shadow-sm"',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

