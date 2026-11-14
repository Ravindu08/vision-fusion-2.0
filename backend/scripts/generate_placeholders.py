import os

stages = ['recruit', 'builder', 'pathfinder', 'intelligence-operative', 'vanguard']
poses = ['pose_1', 'pose_2', 'pose_3', 'pose_4', 'pose_5']
colors = {
    'recruit': ('#38bdf8', 'THE RECRUIT', '#0284c7'),
    'builder': ('#06b6d4', 'THE BUILDER', '#0891b2'),
    'pathfinder': ('#10b981', 'THE PATHFINDER', '#059669'),
    'intelligence-operative': ('#a855f7', 'THE INTELLIGENCE OPERATIVE', '#7c3aed'),
    'vanguard': ('#f59e0b', 'THE VANGUARD', '#d97706')
}

pose_labels = {
    'pose_1': 'IDLE STANCE',
    'pose_2': 'ACTIVE COMBAT',
    'pose_3': 'CELEBRATION',
    'pose_4': 'QUIZ FOCUS',
    'pose_5': 'CYBERNETIC'
}

base_dir = r'frontend/public/assets/characters'

for stage in stages:
    stage_path = os.path.join(base_dir, stage)
    os.makedirs(stage_path, exist_ok=True)
    accent, title, dark_accent = colors[stage]
    
    for pose in poses:
        label = pose_labels[pose]
        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="grad_{stage}_{pose}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="{dark_accent}" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="400" height="500" fill="transparent"/>
  <polygon points="200,40 360,130 360,370 200,460 40,370 40,130" fill="url(#grad_{stage}_{pose})" stroke="{accent}" stroke-width="3" stroke-dasharray="10 5"/>
  <circle cx="200" cy="220" r="110" fill="none" stroke="{accent}" stroke-width="1.5" opacity="0.5"/>
  <circle cx="200" cy="220" r="85" fill="#0b0f19" stroke="{accent}" stroke-width="2"/>
  <path d="M200,160 C180,160 165,175 165,195 C165,215 180,230 200,230 C220,230 235,215 235,195 C235,175 220,160 200,160 Z M150,280 C150,250 170,240 200,240 C230,240 250,250 250,280 L250,295 L150,295 Z" fill="{accent}" filter="url(#glow)"/>
  <text x="200" y="340" text-anchor="middle" fill="{accent}" font-family="monospace" font-size="16" font-weight="bold" letter-spacing="2">{title}</text>
  <text x="200" y="365" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="1">{label} [{pose.upper()}]</text>
  <text x="200" y="420" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="10">OFFICIAL ASSET SLOT - 25 POSES</text>
</svg>"""
        filepath = os.path.join(stage_path, f'{pose}.png')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg_content)

print("Successfully generated 25 official character placeholder asset slots!")

