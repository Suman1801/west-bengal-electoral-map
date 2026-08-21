import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Header
content = re.sub(
    r'(\? "bg-\[#0f172a\] border-slate-800 shadow-md"\n\s*: ")bg-white border-slate-200 shadow-sm"',
    r'\1bg-indigo-50/90 backdrop-blur-md border-indigo-200 shadow-sm"',
    content
)

# Main Background
content = re.sub(
    r'(\? "bg-\[#1a1a2e\]" : ")bg-slate-100"',
    r'\1bg-slate-50"',
    content
)

# Dropdown list
content = re.sub(
    r'(\? "bg-\[#1e293b\]/95 border-slate-700/50"\n\s*: ")bg-white/95 border-slate-200/50"',
    r'\1bg-indigo-50/95 border-indigo-200/70"',
    content
)

# Search Input
content = re.sub(
    r'(\? "bg-\[#1e293b\] border-slate-700 text-slate-200 focus:ring-blue-500/50"\n\s*: ")bg-white border-slate-300',
    r'\1bg-indigo-50/60 border-indigo-200/80',
    content
)

# Search Results
content = re.sub(
    r'(\? "bg-\[#1e293b\] border-slate-700 shadow-black/50"\n\s*: ")bg-white border-slate-200 shadow-slate-300"',
    r'\1bg-indigo-50 border-indigo-200 shadow-indigo-100"',
    content
)

# View Toggles
content = re.sub(
    r'(\? ")bg-white dark:bg-slate-700 shadow-sm text-blue-600',
    r'\1bg-indigo-100 dark:bg-slate-700 shadow-sm text-indigo-700',
    content
)

# View Toggles outer container
content = re.sub(
    r'("flex items-center rounded-md p-1 border", isDark \? "bg-slate-800 border-slate-700" : ")bg-slate-100 border-slate-200"\)',
    r'\1bg-indigo-50/50 border-indigo-100")',
    content
)

# Theme Toggle
content = re.sub(
    r'(\? "bg-\[#1e293b\] border-slate-700 text-amber-200 hover:border-slate-500"\n\s*: ")bg-white border-slate-300 text-indigo-600 hover:border-slate-400',
    r'\1bg-indigo-50/50 border-indigo-200 text-indigo-600 hover:border-indigo-300',
    content
)

# Legend Overlay
content = re.sub(
    r'(\? "bg-\[#1a2333\]/80 border-slate-700/60 shadow-lg shadow-black/40"\n\s*: ")bg-white/90 border-slate-200/80',
    r'\1bg-blue-50/90 border-blue-200/80',
    content
)
content = re.sub(
    r'(\? "bg-\[#1a2333\]/40 border-slate-700/40 shadow shadow-black/20"\n\s*: ")bg-white/60 border-slate-200/50',
    r'\1bg-blue-50/70 border-blue-200/50',
    content
)

# Swing View Panels
content = re.sub(
    r'(\? "bg-\[#1e293b\] border-slate-700"\n\s*: ")bg-white border-slate-200"',
    r'\1bg-indigo-50/60 border-indigo-100"',
    content
)
content = re.sub(
    r'(\? "bg-\[#1e293b\] text-slate-200 border-slate-700"\n\s*: ")bg-white text-slate-800 border-slate-200"',
    r'\1bg-indigo-50 text-slate-800 border-indigo-100"',
    content
)

# Compare ACs modal
content = re.sub(
    r'(\? "bg-\[#0f172a\] border-slate-800 text-slate-400"\n\s*: ")bg-white border-slate-200 text-slate-500"',
    r'\1bg-indigo-50 border-indigo-200 text-slate-600"',
    content
)

# Right Side Panel bg
content = re.sub(
    r'(\? "bg-\[#0f172a\] border-slate-800"\n\s*: ")bg-slate-50/50 border-slate-200"',
    r'\1bg-indigo-50/30 border-indigo-100"',
    content
)

# Right Side Panel Inner Cards
content = re.sub(
    r'(\? "bg-\[#1e293b\] text-slate-300 border-slate-700"\s*: ")bg-white text-slate-600 border-slate-200',
    r'\1bg-indigo-50/80 text-slate-700 border-indigo-100',
    content
)
content = re.sub(
    r'isDark \? "bg-\[#1e293b\] border-slate-700" : "bg-white border-slate-200"',
    r'isDark ? "bg-[#1e293b] border-slate-700" : "bg-indigo-50/80 border-indigo-100"',
    content
)

# Party List Highlight
content = re.sub(
    r'highlightedParty === name \? \(isDark \? "bg-slate-800 border-slate-700 shadow-sm" : "bg-white shadow-sm border-slate-200"\)',
    r'highlightedParty === name ? (isDark ? "bg-slate-800 border-slate-700 shadow-sm" : "bg-indigo-100 shadow-sm border-indigo-200")',
    content
)

# Selected Feature Tooltip (bottom center)
content = re.sub(
    r'(\? "bg-\[#0f172a\]/80 border-slate-700 text-white"\n\s*: ")bg-white/80 border-slate-200 text-slate-800"',
    r'\1bg-indigo-50/90 border-indigo-200 text-indigo-950"',
    content
)

# Selected Feature Inner circle
content = re.sub(
    r'(\? "border-slate-700 bg-\[#1e293b\]"\n\s*: ")border-slate-100 bg-white"',
    r'\1border-indigo-200 bg-indigo-50"',
    content
)

# Button in header 
content = re.sub(
    r'(\? "bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700" : ")bg-white text-slate-800 border-slate-200 hover:bg-slate-50"',
    r'\1bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100"',
    content
)


with open('src/App.tsx', 'w') as f:
    f.write(content)

