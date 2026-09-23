import re
import sys

def strip_comments(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Very basic comment stripping for this specific file
    # We will remove lines that START with optional whitespace and //
    # and for inline comments, we'll try to find // that's preceded by whitespace and not inside a string
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith('//'):
            continue # skip full line comment
        
        # for inline comments like `const foo = 1; // bar`
        # we can just split by ' // ' (with a leading space) to be safe
        if ' // ' in line:
            line = line.split(' // ')[0]
        new_lines.append(line)
        
    with open(file_path, 'w') as f:
        f.write('\n'.join(new_lines))

strip_comments('server.js')
