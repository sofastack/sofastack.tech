import re
import os
import io

pattern = r"link: '([^']+)/?'"
replacement = r"link: '\1/'"

folder_path = './'

for root, dirs, files in os.walk(folder_path):
    for file_name in files:
        if file_name == '_index.md':
            file_path = os.path.join(root, file_name)
            with io.open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

            with io.open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
