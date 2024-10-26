import os
import re
from collections import defaultdict

def extract_icons(directory):
    icons = defaultdict(set)
    pattern = r'i-(?:\w|-|_)+:(?:\w|-|_)+'
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = re.findall(pattern, content)
                    for match in matches:
                        icons[match].add(file_path)
    
    return icons

# Usage
src_directory = './src'  # Replace with your src directory path
extracted_icons = extract_icons(src_directory)

# Print the extracted icons and their associated files
for icon, files in sorted(extracted_icons.items(), key=lambda entry: entry[0].split(":")[1]):
    print(f"Icon: {icon}")
    for file in sorted(files):
        print(f"  - {file}")
    print()

# Write the icons and their files to a text file
with open('extracted_icons_with_files.txt', 'w') as f:
    for icon, files in sorted(extracted_icons.items(), key=lambda entry: entry[0].split(":")[1]):
        f.write(f"Icon: {icon}\n")
        for file in sorted(files):
            f.write(f"  - {file}\n")
        f.write("\n")

print(f"Extracted {len(extracted_icons)} icons. Results saved to 'extracted_icons_with_files.txt'")