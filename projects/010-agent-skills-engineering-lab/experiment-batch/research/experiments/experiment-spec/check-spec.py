"""Check only that the example spec has its advertised structural elements."""
from pathlib import Path
import re

spec = Path(__file__).with_name("SPEC.md").read_text(encoding="utf-8")
sections = ["目标", "技术栈", "命令", "项目结构", "代码风格", "测试策略", "边界", "验收条件"]
missing = [section for section in sections if f"## {section}" not in spec]
assert not missing, f"Missing sections: {missing}"
acceptance = spec.split("## 验收条件\n", 1)[1].split("\n## ", 1)[0]
assert re.findall(r"(?m)^([1-5])\. ", acceptance) == list("12345"), "Missing numbered criterion"
assert all(term in spec for term in ("始终", "按实际授权处理", "禁止")), "Missing boundary tier"
print("PASS: 8 required sections, 5 acceptance criteria, 3 boundary tiers present")
